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
          // console.log(classActiveImageVis);
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

      const event = new Event('updated');
      thisWidget.element.dispatchEvent(event);

    }

  }

  class Cart {
    constructor(element){
      const thisCart = this;

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


    }

    initActions(){

      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener('click', function(){

        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);

      });

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
      // console.log('thisCart.products', thisCart.products);

    }
  }
  
  class CartProduct {

    constructor(menuProduct, element) {

      const thisCartProduct = this;


      thisCartProduct.id = menuProduct.id;

      thisCartProduct.name = menuProduct.name;

      thisCartProduct.price = thisCartProduct.amount*thisCartProduct.priceSingle;

      thisCartProduct.priceSingle = menuProduct.priceSingle;

      thisCartProduct.amount = thisCartProduct.amountWidget.value;

      thisCartProduct.params = JSON.parse(JSON.stringify(menuProduct.params));

      thisCartProduct.getElements(element);

      // console.log ('thisCartProduct', thisCartProduct);

      // console.log ('productData', menuProduct); 

      thisCartProduct.initAmountWidget();

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


      thisCartProduct.amountWidgetElem.addEventListener('updated', function(){

        

      });

    } 
  }

  const app = {
    initMenu: function(){
      const thisApp = this;

      // console.log('thisApp.data:', thisApp.data);

      for(let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]);
      }
    },
    initData:function(){
      const thisApp = this;

      thisApp.data = dataSource;
    },
    init: function(){
      const thisApp = this;
      // console.log('*** App starting ***');
      // console.log('thisApp:', thisApp);
      // console.log('classNames:', classNames);
      // console.log('settings:', settings);
      // console.log('templates:', templates);
      thisApp.initData();
      thisApp.initMenu();
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


