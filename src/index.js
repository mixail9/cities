import Phaser from 'phaser';
import MainScene from './MainScene';


var config = {
        type: Phaser.AUTO,
        //width: 800,
        //height: 600,
        /*physics: {
            default: 'matter',
            matter: {
                //gravity: { y: 0 },
                debug: false
            }
        },*/
        scene: [MainScene],
        scale: {
            mode: Phaser.DOM.FIT,
            orientation: Phaser.Scale.Orientation.LANDSCAPE,
            width: window.innerWidth,
            height: window.innerHeight
        }
};

var game = new Phaser.Game(config);

