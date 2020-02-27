
const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Animation)
    animation: cc.Animation = null;
    private call: Function;

    start() {
        this.animation.on(cc.Animation.EventType.FINISHED, this.runOver, this);

        let randTime = Math.random() * 0.2 + 0.5;
        let randCeil = Math.random() * 5 + 10;

        let ani = cc.sequence(cc.moveBy(randTime, 0, randCeil), cc.moveBy(randTime * 2, 0, -randCeil * 2), cc.moveBy(randTime, 0, randCeil));
        this.node.runAction(cc.repeatForever(ani));
    }

    runOver() {
        if (this.call) {
            this.call();
            this.node.stopAllActions();
            this.node.destroy();
        }
    }

    attack(call) {
        this.call = call;
        this.animation.play("attack1");
    }
}
