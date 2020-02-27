import { monsterType } from "../Comm/forestEnum";

/**
 * 怪物节点脚本
 */
const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Sprite)
    icon: cc.Sprite = null;
    @property(cc.SpriteFrame)
    iconArr: Array<cc.SpriteFrame> = [];

    @property(cc.BoxCollider)
    boxCollider: cc.BoxCollider = null;

    public type: monsterType;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {

    }

    initData(type) {
        this.type = type;
        this.icon.spriteFrame = this.iconArr[type - 1];
        this.boxCollider.size.width = this.icon.node.width;
        this.boxCollider.size.height = this.icon.node.height;
        this.boxCollider.offset.y = this.icon.node.height / 2;
        if (type == monsterType.CanJump || type == monsterType.CanJumpKill) {
            this.boxCollider.size.width /= 2;
            this.boxCollider.offset.x = -50;
        }
    }

    exchangeForm() {
        if (this.type == monsterType.CanKill) {//如果怪物是 dogger 拉拉死亡
            // this.type = monsterType.CanKill_2;
            this.icon.spriteFrame = this.iconArr[this.type];
        }
    }

    dead() {
        this.node.destroy();
    }

    // update (dt) {}
}
