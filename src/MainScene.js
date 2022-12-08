import Phaser from 'phaser';
import { Buttons, Label, RoundRectangle } from 'phaser3-rex-plugins/templates/ui/ui-components.js'

const FACTORY_NONE = '0';
const FACTORY_FOOD = 'food';
const FACTORY_FUEL = 'fuel';

const ACTION_NONE = 0;
const ACTION_SELECT = 1;
const ACTION_ROUTE = 2;
const ACTION_ROUTE_END = 3;

const PRODUCE_STEP = 0.7;
const CONSUME_STEP = 0.3;


const COLOR_PRIMARY = 0x4e342e;
const COLOR_LIGHT = 0x7b5e57;
const COLOR_DARK = 0x260e04;



class MainScene extends Phaser.Scene {

	constructor() {
		super('MainScene');
  }
    

	preload() {

    //this.load.setBaseURL('http://127.0.0.1:8080/');

		this.load.image('background', '/assets/img/stars.jpg');
		this.load.image('emojiBad', '/assets/img/smilesad.png');
		this.load.image('emojiNeutral', '/assets/img/smileneutral.png');
		this.load.image('emojiGood', '/assets/img/smilehappy.png');

  }
    
  create() {
    
    console.log('create');
    this.createReal();

    /*
    let that = this;
    setTimeout(() => {
      //bg.setTexture('background');
      that.createReal();
    }, 15000);
    */
  }

	createReal() {

      console.log('createReal');

        let bg = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, this.cameras.main.width, this.cameras.main.height, 'background');  
        
        bg.setTexture('background');

        this.cities = [];
        this.vagons = [];


        let oneCity = {
          x: 100,
          y: 100,
          storage: {
            food: 10,
            fuel: 20
          },
          level: 1,
          people: 10,
          factory: FACTORY_NONE,
          imgGroup: null,
          imgStorages: {},
          imgCity: null
        };
        this.cities.push(oneCity);

        oneCity = {
          x: 300,
          y: 200,
          storage: {
            food: 10,
            fuel: 70
          },
          level: 1,
          people: 10,
          factory: FACTORY_FOOD,
          imgGroup: null,
          imgStorages: {},
          imgCity: null
        };
        this.cities.push(oneCity);

        this.renderCities();
        this.renderCityActionPanel();

        this.cityAction = ACTION_NONE;
  }

  renderCityActionPanel() {
    this.cityActionPanel = this.add.container(0, 0);
    this.cityActionPanel.setVisible(false)/*.setOrigin(0, 0)*/;

    let border = this.add.circle(0, 0, 60);
    border.setStrokeStyle(3, 0xfff000);
    this.cityActionPanel.add(border);

    let actionRouteImg =  this.add.circle(-60, 0, 15, 0xf00000);
    actionRouteImg.setInteractive();
    actionRouteImg.on('pointerdown', () => {
      console.log('action close');
      this.cityAction = ACTION_NONE;
      this.hideCityActions();
    });
    this.cityActionPanel.add(actionRouteImg);

    actionRouteImg =  this.add.circle(0, -60, 15, 0x00f000);
    actionRouteImg.setInteractive();
    actionRouteImg.on('pointerdown', () => {
      console.log('action route');
      this.cityAction = ACTION_ROUTE;
      /*
      this.showModalQuestion('hello', function(){console.log('action ok');});
      this.cityActionPanel.action = ACTION_ROUTE;
      this.updateCityActions();
      */

      //this.showModalYesNo(function(){console.log('action ok');});
      
    });
    this.cityActionPanel.add(actionRouteImg);

    actionRouteImg =  this.add.circle(0, 60, 15, 0x0000f0);
    actionRouteImg.setInteractive();
    actionRouteImg.on('pointerdown', () => {
      console.log('action upgrade');
    });
    this.cityActionPanel.add(actionRouteImg);

  }

  renderCities() {

    for(let i in this.cities) {

      this.cities[i].imgGroup = this.add.container(this.cities[i].x, this.cities[i].y);
      this.cities[i].imgCity = this.add.image(0, 0, 50, 50, 'emojiBad');
      this.cities[i].imgCity.setTexture('emojiBad');
      //this.cities[i].imgCity = this.add.circle(0, 0, 20, 0xffffff);

      this.cities[i].imgGroup.add(this.cities[i].imgCity);

      let index = -1;
      for(let j in this.cities[i].storage) {
        
        let border = this.add.rectangle(30, -20 + (++index)*15, 33, 11);
        border.setStrokeStyle(3, 0xff0000).setOrigin(0, 0);
        this.cities[i].imgGroup.add(border);

        this.cities[i].imgStorages[j] = this.add.rectangle(32, -18 + (index)*15, 30 * (this.cities[i].storage[j] / 100), 5, 0x0000ff);
        this.cities[i].imgStorages[j].setOrigin(0, 0);
        this.cities[i].imgGroup.add(this.cities[i].imgStorages[j]);
      }

      this.cities[i].imgCity.setInteractive();
      this.cities[i].imgCity.on('pointerdown', () => {

        if(this.cityActionPanel.cityIndex == i)
          this.hideCityActions();

        if(ACTION_SELECT == this.cityAction || ACTION_NONE == this.cityAction)
          this.showCityActions(i);

        if(ACTION_ROUTE == this.cityAction && this.cityActionPanel.cityIndex != i) {
          this.showModalYesNo(function(){console.log('action ok');});
          this.renderRoute(this.cities[this.cityActionPanel.cityIndex], this.cities[i], true);
        }

      });

    }
  }


  renderCityStorage(cityIndex, storageIndex) {
    this.cities[cityIndex].imgStorages[storageIndex].width = Math.round(30 * (this.cities[cityIndex].storage[storageIndex] / 100));
  }
  
  update() {

    for(let i in this.cities) {
      this.produceCity(i);
      this.consumeCity(i);
    }
  }

  showCityActions(index) {

    this.cityActionPanel.setX(this.cities[index].x);
    this.cityActionPanel.setY(this.cities[index].y);

    this.cityActionPanel.setVisible(true);
    this.cityActionPanel.cityIndex = index;
  }

  hideCityActions() {
    this.cityAction = ACTION_NONE;
    this.cityActionPanel.setVisible(false);
  }

  updateCityActions() {

  }


  produceCity(index) {
    let city = this.cities[index];
    if(city.factory != FACTORY_NONE) {
      city.storage[city.factory] += PRODUCE_STEP;

      if(city.storage[city.factory] > 100)
      city.storage[city.factory] = 100;

      if(Math.round(city.storage[city.factory] - PRODUCE_STEP) != Math.round(city.storage[city.factory]))
        this.renderCityStorage(index, city.factory);
    }
  }

  consumeCity(index) {
    let city = this.cities[index];
    for(let i in city.storage) {

      city.storage[i] -= CONSUME_STEP;
      if(city.storage[i] < 0)
        city.storage[i] = 0;

      if(Math.round(city.storage[i] + CONSUME_STEP) != Math.round(city.storage[i]))
        this.renderCityStorage(index, i);
    }
  }


  processVagon(index) {
    let that = this;
    setTimeout(() => {
      that.startMoveVagon(index);
    }, 1000);
  }

  startMoveVagon(index) {
    let that = this;
    this.vagons[index].img;
    setTimeout(() => {
      that.endMoveVagon(index);
    }, 3000);
  }

  endMoveVagon(index) {
    this.processVagon(index);
  }


  showModalQuestion(text, okBtnCallback) {


    if(this.modalQuestion) {
      this.modalQuestion.text.setText(text);
      this.modalQuestion.container.setVisible(true);
      return true;
    }

    this.modalQuestion = {};
    this.modalQuestion.container = this.add.container(0, 0);

    let bg = this.add.rectangle(0, 0, 400, 400, 0xaaaaaa, 0.6);
    bg.setStrokeStyle(3, 0xbbbbbb).setOrigin(0, 0);
    this.modalQuestion.container.add(bg);

    this.modalQuestion.text = this.add.text(200, 200, text);
    this.modalQuestion.container.add(this.modalQuestion.text);

    let btnBody = this.createButton({x: 300, y: 300, text: 'close !!!', parent: this.modalQuestion.container});

    btnBody.setInteractive();
    btnBody.on('pointerdown', () => {
      console.log('action close');
      this.modalQuestion.container.setVisible(false);
    });

    if(okBtnCallback) {
      btnBody = this.createButton({x: 100, y: 300, text: 'ok', parent: this.modalQuestion.container});
  
      btnBody.setInteractive();
      btnBody.on('pointerdown', () => {
        okBtnCallback();
      });    
    }

    //this.modalQuestion.container.add(btnBody);
    //this.modalQuestion.container.add(bodyText);

    
    /*
    var buttons = new Buttons(this, {
      x: 100,
      y: 300,
      buttons: [this.createButton('accept')]
    }).layout();
    this.add.existing(buttons);
    //this.modalQuestion.container.add.existing(buttons);
    */

  }

  createButton(params) {
    let x = 0, 
      y = 0,
      text = 'ok';

    if(params && params.x)
      x = params.x;
    if(params && params.y)
      y = params.y;
    if(params && params.text)
      text = params.text;

    
    let btnBody = this.add.rectangle(x, y, 100, 30, 0xaaaaaa);
    btnBody.setStrokeStyle(1, 0xff0000).setOrigin(0, 0);
    let bodyText = this.add.text(x, y+5, text);
    bodyText.setOrigin(0, 0);

    if(params && params.parent) {
      params.parent.add(btnBody);
      params.parent.add(bodyText);
    }

    return btnBody;
  }

  createButton2(text) {
    return new Label({
        width: 40,
        height: 40,
        background: new RoundRectangle(0, 0, 0, 0, 20, COLOR_LIGHT),
        text: this.add.text(0, 0, text, {
            fontSize: 18
        }),
        space: {
            left: 10,
            right: 10,
        },
        align: 'center'
    });
  }


  showModalYesNo(okBtnCallback) {


    if(this.modalYesNo) {
      this.modalYesNo.setVisible(true);
      return true;
    }

    this.modalYesNo = {};
    this.modalYesNo = this.add.container(0, 400);

    let btnBody = this.createButton({x: 300, y: 300, text: 'close', parent: this.modalYesNo});

    btnBody.setInteractive();
    btnBody.on('pointerdown', () => {
      console.log('action close');
      this.modalYesNo.setVisible(false);
    });

    if(okBtnCallback) {
      btnBody = this.createButton({x: 100, y: 300, text: 'ok', parent: this.modalYesNo});
  
      btnBody.setInteractive();
      btnBody.on('pointerdown', () => {
        okBtnCallback();
      });    
    }
  }


  renderRoute(from, to, isPreview) {
    console.log('renderRoute from', from.x, from.y);
    console.log('renderRoute to', to.x, to.y);
    let opacity = 1;
    if(isPreview)
      opacity = 0.6;
    let routeImg = this.add.line(0, 0, from.x+10, from.y+10, to.x-10, to.y-10, 0xff0000, opacity);
    routeImg.setLineWidth(2, 2).setOrigin(0, 0);
    return routeImg;
  }

}




export default  MainScene ;
