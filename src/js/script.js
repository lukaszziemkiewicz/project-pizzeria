/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };
  
  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };
  
  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    // CODE ADDED END
    db: {
      url: '//localhost:3131',
      product: 'product',
      order: 'order',
    },
  };
  
  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    // CODE ADDED END
  };

  class Product{
    constructor(id, data){
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();
      // console.log('new Product', thisProduct);
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.processOrder();
      thisProduct.initAmountWidget();
      

    }

    renderInMenu(){
      const thisProduct = this;

      /*generate HTML based on template*/

      const generatedHTML = templates.menuProduct(thisProduct.data);
     

      /*create element using utils.createElementFromHTML */

      thisProduct.element = utils.createDOMFromHTML(generatedHTML);

      /* find menu container */

      const menuContainer = document.querySelector(select.containerOf.menu);

      /* add element to menu */

      menuContainer.appendChild(thisProduct.element);

    }

    getElements(){
      const thisProduct = this;
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      // console.log(thisProduct.accordionTrigger);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      // console.log(thisProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      // console.log(thisProduct.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      // console.log(thisProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      // console.log(thisProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
      // console.log(thisProduct.amountWidgetElem);
      

    }

    initAccordion(){
      const thisProduct = this;
  
      /* find the clickable trigger (the element that should react to clicking) */
  
      // const clicableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      // // console.log(clicableTrigger);
  
      /* START: click event listener to trigger */
  
      thisProduct.accordionTrigger.addEventListener('click', function(event){
        // console.log(thisProduct.accordionTrigger);
  
        /* prevent default action for event */
  
        event.preventDefault();
  
        /* toggle active class on element of thisProduct */
  
        thisProduct.element.classList.toggle('active');
        // console.log(thisProduct);
  
        /* find all active products */
        
        const allActiveProducts = document.querySelectorAll('article.active');
        //  console.log(allActiveProducts);

        /* START LOOP: for each active product */
  
        for(let activeProduct of allActiveProducts ){
          
          /* START: if the active product isn't the element of thisProduct */
  
          if( activeProduct !== thisProduct.element){
            
            /* remove class active for the active product */
  
            activeProduct.classList.remove('active');
            // console.log(activeProduct);
          }
  
          /* END: if the active product isn't the element of thisProduct */
  
        }
  
        /* END LOOP: for each active product */  
        
      });
  
      /* END: click event listener to trigger */
      
    }

    initOrderForm(){

      const thisProduct = this;
      // console.log(this.initOrderForm);

      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
      
      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }
      
      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });

    }

    processOrder(){
      
      const thisProduct = this;
      // console.log(this.processOrder);

      const formData = utils.serializeFormToObject(thisProduct.form);
      // console.log('formData', formData);
      
      thisProduct.params = {};

      /*price of the product from thisProduct.data.price*/

      let price = thisProduct.data.price;
      // console.log(price);

      const paramsOfProduct = thisProduct.data.params;
      // console.log(paramsOfProduct);

      

      // /* START LOOP: for each paramId in thisProduct.data.params */
      for(let paramId in paramsOfProduct){

        //   /* save the element in thisProduct.data.params with key paramId as const param */

        const param = paramsOfProduct[paramId];

        // console.log(param);

        /* START LOOP: for each optionId in param.options */

        for(let optionId in param.options){ 

          /* save the element in param.options with key optionId as const option */

          const option = param.options[optionId];
          // console.log(option);
        
          const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;
          // console.log(optionSelected);

          /* START IF: if option is selected and option is not default */


          if(optionSelected && !option.default){

            /* add price of option to variable price */

            price += option.price;

            /* END IF: if option is selected and option is not default */

            /* START ELSE IF: if option is not selected and option is default */

          } else if(!optionSelected && option.default){

            /* deduct price of option from price */

            price -= option.price;

          }

          /* END ELSE IF: if option is not selected and option is default */

          const classActiveImageVis = classNames.menuProduct.imageVisible;
          console.log(classActiveImageVis);
          // console.log(classActiveImageVis);


          const allImagesOptionId = thisProduct.imageWrapper.querySelectorAll(`.${paramId}-${optionId}`);
          // console.log(allImagesOptionId);

          
          if(optionSelected){

            if(!thisProduct.params[paramId]){
             
              thisProduct.params[paramId] = {
                label: param.label,
                options: {},
              };   
            }
            
            thisProduct.params[paramId].options[optionId] = option.label;
            // console.log(thisProduct.params);
          

            for (let image of allImagesOptionId) {
              image.classList.add(classNames.menuProduct.imageVisible);
            }

          } else {

            for (let image of allImagesOptionId) {
              image.classList.remove(classNames.menuProduct.imageVisible);
            }

          }

        }

        /* END LOOP: for each optionId in param.options */
      

      } 

      /* set the contents of thisProduct.priceElem to be the value of variable price */

      /*put price ito the element of thisProduct.priceElem*/

      // price *= thisProduct.amountWidget.value; 

      // price *= thisProduct.amountWidget ? thisProduct.amountWidget.value : thisProduct.priceElem.innerHTML;
      // console.log(price);

      // if (thisProduct.amountWidget) {
      //   price *= thisProduct.amountWidget.value;
      // }
      // console.log(price);

      // thisProduct.priceElem.innerHTML = price;
      // console.log(thisProduct.priceElem.innerHTML);
      
      /* multiply price by amount */

   

      if(thisProduct.amountWidget){

        thisProduct.priceSingle = price;

        thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;
      }

      /* multiply price by amount */


      if (thisProduct.price) {
        thisProduct.priceElem.innerHTML = thisProduct.price;
      }
      /* set the contents of thisProduct.priceElem to be the value of variable price */
      // thisProduct.priceElem.innerHTML = thisProduct.price;


    }

    initAmountWidget(){

      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);

      // console.log(thisProduct.amountWidget); 


      thisProduct.amountWidgetElem.addEventListener('updated', function(){

        thisProduct.processOrder();

      });

    } 

    addToCart(){

      const thisProduct = this;
      console.log(thisProduct);

      thisProduct.name = thisProduct.data.name;

      thisProduct.amount = thisProduct.amountWidget.value;

      app.cart.add(thisProduct);

    }
  }

  class AmountWidget{
    constructor(element){
      const thisWidget = this;

      thisWidget.getElements(element);
      thisWidget.value = settings.amountWidget.defaultValue;
      thisWidget.setvalue(thisWidget.input.value);
      thisWidget.initActions();

      // console.log('AmountWidget:', thisWidget);
      // console.log('constructor arguments:', element);

    }

    getElements(element){
      const thisWidget = this;
    
      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    setvalue(value){

      const thisWidget = this;

      const newValue = parseInt(value);

      // TODO: Add validation
      if(newValue != thisWidget.value && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax ) {

        thisWidget.value = newValue;
        thisWidget.announce();

      }

      thisWidget.input.value = thisWidget.value;
    }

    initActions(){

      const thisWidget = this;

      thisWidget.input.addEventListener('change', function(){

        thisWidget.setvalue(thisWidget.input.value);

      });

      thisWidget.linkDecrease.addEventListener('click', function(event){

        event.preventDefault();

        thisWidget.setvalue(thisWidget.value - 1);
        

      });

      thisWidget.linkIncrease.addEventListener('click', function(event){

        event.preventDefault();

        thisWidget.setvalue(thisWidget.value + 1);


      });


    }

    announce(){

      const thisWidget = this;

      const event = new CustomEvent('updated', {
        bubbles: true
      });
      thisWidget.element.dispatchEvent(event);

    }

  }

  class Cart {
    constructor(element){
      const thisCart = this;

      thisCart.deliveryFee = settings.cart.defaultDeliveryFee;

      // console.log(thisCart.deliveryFee);

      thisCart.products = [];

      

      thisCart.getElements(element);

      // console.log('new Cart', thisCart);

      thisCart.initActions();

      

    }

    getElements(element){

      const thisCart = this;

      thisCart.dom = {};

      thisCart.dom.wrapper = element;

      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);

      thisCart.dom.productList = document.querySelector(select.cart.productList);

      thisCart.renderTotalsKeys = ['totalNumber', 'totalPrice', 'subtotalPrice', 'deliveryFee'];

      console.log(thisCart.renderTotalsKeys);

      for(let key of thisCart.renderTotalsKeys){
        thisCart.dom[key] = thisCart.dom.wrapper.querySelectorAll(select.cart[key]);
        console.log(thisCart.dom[key]);
      }

      thisCart.dom.form = document.querySelector(select.cart.form);
      console.log(thisCart.dom.form);

      thisCart.dom.phone = document.querySelector(select.cart.phone);
      console.log(thisCart.dom.phone);

      thisCart.dom.address = document.querySelector(select.cart.address);
      console.log(thisCart.dom.address);

    }



    initActions(){

      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener('click', function(){

        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);


      });

      thisCart.dom.productList.addEventListener('updated', function(){
        thisCart.update();
      });

      
      thisCart.dom.productList.addEventListener('remove', function(){
        thisCart.remove(event.detail.cartProduct);
      });

      thisCart.dom.form.addEventListener('submit', function(event){
      
      event.preventDefault();

      thisCart.sendOrder();

      

      });
    }

    sendOrder(){

      const thisCart = this;

      const url = settings.db.url + '/' + settings.db.order;

      const payload = {
        address: thisCart.dom.address,
        phone: thisCart.dom.phone,
        totalPrice: thisCart.totalPrice,
        subtotalPrice: thisCart.subtotalPrice,
        totalNumber: thisCart.totalNumber,
        deliveryFee: thisCart.deliveryFee,
        products: [],
        
      };

      console.log(thisCart.products)
      
      for(let singleProduct  of thisCart.products ){

        
        console.log(thisCart.Products);
        const singleProductgetDataResult = singleProduct.getData();
        

        console.log(singleProductgetDataResult);

        payload.products.push(singleProductgetDataResult);
        console.log(payload.products);

        }
      


      const options = {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      };

      fetch(url, options)
      .then(function(response){
        return response.json();
      }).then(function(parsedResponse){
        console.log('parsedResponse', parsedResponse);
      });

    }

    remove(cartProduct){

      const thisCart = this;

      const index = thisCart.products.indexOf(cartProduct);

      console.log(index);

      thisCart.products.splice(index,1);
      
      console.log(thisCart.products);


      cartProduct.dom.wrapper.remove();


      // let thisCartProductslength = thisCart.products.length;

      // console.log(thisCartProductslength);
      
      // if(thisCartProductslength == 0 ){

      //   const priceDeliveryToZero =  document.querySelector(select.cart.deliveryFee);

      //   console.log(priceDeliveryToZero);
  
      //   priceDeliveryToZero.innerHTML = 0;
  
      //   console.log(priceDeliveryToZero.innerHTML);
          
        
      // }

      thisCart.update();


    }



    add(menuProduct){

      const thisCart = this;

      /*generate HTML based on template*/

      const generatedHTML = templates.cartProduct(menuProduct);
      // console.log(generatedHTML);

      /*create element using utils.createElementFromHTML */

      const generatedDOM = utils.createDOMFromHTML(generatedHTML);
      // console.log(generatedDOM);

      thisCart.dom.productList.appendChild(generatedDOM);


      // const thisCart = this;
      // console.log('adding product', menuProduct);

      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
      console.log('thisCart.products', thisCart.products);

      thisCart.update();
      
    }

    update(){

      const thisCart = this;

      thisCart.totalNumber = 0;

      console.log(thisCart.totalNumber);

      thisCart.subtotalPrice = 0;

      for(let  thisCartProduct of thisCart.products ) {

        thisCart.subtotalPrice = thisCart.subtotalPrice + thisCartProduct.price;

        console.log(thisCart.subtotalPrice);

        thisCart.totalNumber = thisCart.totalNumber + thisCartProduct.amount;

        console.log(thisCart.totalNumber);

      }

      thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee; 
      
      console.log(thisCart.totalPrice);

      if(thisCart.subtotalPrice == 0 ) {
        thisCart.totalPrice = 0;

        thisCart.deliveryFee = 0;

      } else {
        thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;

        
      }

      for(let key of thisCart.renderTotalsKeys){
        for(let elem of thisCart.dom[key]){
          console.log(elem);
          elem.innerHTML = thisCart[key];
          console.log(elem.innerHTML);
        }
      }
    }
  }
  
  class CartProduct {

    constructor(menuProduct, element) {

      const thisCartProduct = this;

      

      thisCartProduct.id = menuProduct.id;

      thisCartProduct.name = menuProduct.name;

      thisCartProduct.price = menuProduct.price;

      console.log(thisCartProduct.price);

      thisCartProduct.priceSingle = menuProduct.priceSingle;

      console.log(thisCartProduct.priceSingle);

      thisCartProduct.amount = menuProduct.amount;

      thisCartProduct.params = JSON.parse(JSON.stringify(menuProduct.params));

      thisCartProduct.getElements(element);

      // console.log ('thisCartProduct', thisCartProduct);

      // console.log ('productData', menuProduct); 
      thisCartProduct.initAmountWidget();

      thisCartProduct.initActions();      

    }

    getElements(element){

      const thisCartProduct = this;

      thisCartProduct.dom = {};

      thisCartProduct.dom.wrapper = element;

      thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);

      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);

      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);

      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);

    }

    
    initAmountWidget(){

      const thisCartProduct = this;

      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);

      // console.log(thisProduct.amountWidget); 


      thisCartProduct.dom.amountWidget.addEventListener('updated', function(){

        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        
        thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;

        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;

      });

    } 

    remove(){

      const thisCartProduct = this;

      const event = new CustomEvent('remove', {
        bubbles:true,
        detail: {
          cartProduct: thisCartProduct,
        },
      });
      console.log(event);

      thisCartProduct.dom.wrapper.dispatchEvent(event);
    }

    initActions(){

      const thisCartProduct = this; 

      thisCartProduct.dom.edit.addEventListener('click', function(event){
        event.preventDefault();
      });

      thisCartProduct.dom.remove.addEventListener('click', function(event){
        event.preventDefault();
        thisCartProduct.remove();
        
      });

    }

    // getData(){

    //   const thisCartProduct = this;

    //   return thisCartProduct.id, thisCartProduct.price, thisCartProduct.priceSingle, thisCartProduct.params, thisCartProduct.amount;
    //   console.log(getData);
    // }

    getData() {
      const thisCartProduct = this;

      const productData = {
        OrderedItems: {
          id: thisCartProduct.id,
          amount: thisCartProduct.amount,
          price: thisCartProduct.price,
          priceSingle: thisCartProduct.priceSingle,
          params: thisCartProduct.params
        }
      };
      return productData;
    }

    
  
 
    
  }

  const app = {
    initMenu: function(){
      const thisApp = this;

      // console.log('thisApp.data:', thisApp.data);

      for(let productData in thisApp.data.products){
        new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
      }
    },
    initData:function(){
      const thisApp = this;

      thisApp.data = {};
      console.log(thisApp.data);

      const url = settings.db.url + '/' + settings.db.product;

      fetch(url)
        .then(function(rawResponse){
          return rawResponse.json();
        })
        .then(function(parsedResponse){
          console.log('parsedResponse', parsedResponse);

          // save parsedResponse as thisApp.data.products

          thisApp.data.products = parsedResponse;

          // execute initMenu method 

          thisApp.initMenu();

        });



        
    },
    init: function(){
      const thisApp = this;
      // console.log('*** App starting ***');
      // console.log('thisApp:', thisApp);
      // console.log('classNames:', classNames);
      // console.log('settings:', settings);
      // console.log('templates:', templates);
      thisApp.initData();
      
      thisApp.initCart();
    },
    initCart: function(){
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      // console.log(cartElem);
      thisApp.cart = new Cart(cartElem);

    
    },
  };

  app.init();
}


