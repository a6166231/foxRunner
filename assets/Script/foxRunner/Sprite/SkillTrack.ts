import { skillBelongType, FoxSkills } from "../Comm/forestEnum";
import forestScene from "../forestScene";
import forestComm from "../Comm/forestComm";

/**
 * 技能块
 */

const { ccclass, property } = cc._decorator;

@ccclass
export default class SkillTrack extends cc.Component {

    @property(cc.Node)
    maskNode: cc.Node = null;
    @property(cc.Label)
    infoLabel: cc.Label = null;
    /** 归属区域的类型 */
    public belongType: skillBelongType;
    /** 技能类型 */
    private type: FoxSkills;

    private gameScene: forestScene;

    public isUsing: boolean = false;
    private canClick: boolean = true;
    private data = null;

    public lastPosNode: cc.Node;

    private defaultData = {
        pos: null,
        parent: null,
    }

    /** 初始化数据 */
    initData(data, belongType: skillBelongType) {
        this.data = data;
        this.belongType = belongType;
        this.type = Number(data);
        // this.infoLabel.string = data.name;
        switch (this.type) {
            case FoxSkills.Walk:
                this.infoLabel.string = "WALKING"; break;
            case FoxSkills.Run:
                this.infoLabel.string = "RUNNING"; break;
            case FoxSkills.Jump:
                this.infoLabel.string = "JUMPING"; break;
            case FoxSkills.OpenDoor:
                this.infoLabel.string = "OPEN DOOR"; break;
            case FoxSkills.PickUp:
                this.infoLabel.string = "PICK UP"; break;
            case FoxSkills.Attack:
                this.infoLabel.string = "ATTACK"; break;
        }
    }

    start() {
        this.isUsing = false;
        this.canClick = true;

        this.defaultData.pos = this.node.position;
        this.defaultData.parent = this.node.parent;

        this.gameScene = cc.find("Canvas").getComponent("forestScene");
        this.addListener();
    }

    touchEnd() {
        if (this.isUsing || this.maskNode.active)
            return;
        let event = new cc.Event.EventCustom(forestComm.EventType.skillEntry, true);
        event.setUserData(this);
        this.node.dispatchEvent(event);
    }

    /** 返回默认的位置 */
    goBackToDefaultPos() {
        this.canClick = false;
        let pos = this.defaultData.parent.convertToWorldSpaceAR(this.defaultData.pos);
        let ani = cc.sequence(cc.moveTo(0.5, this.node.parent.convertToNodeSpaceAR(pos)), cc.callFunc(() => {
            if (ani) {
                if (this.gameScene.staticTop.childrenCount >= 2) {
                    this.node.destroy();
                }
                this.lastPosNode.getComponent("SkillTrack").maskNode.active = false;
                this.canClick = true;
                this.isUsing = false;
                this.node.parent = this.defaultData.parent;
                this.node.position = this.defaultData.pos;
            }
        }, this));
        this.node.runAction(ani);
    }

    addListener() {
        this.node.on(cc.Node.EventType.TOUCH_MOVE, (event) => {
            event.stopPropagation();
            if (!this.canClick || this.maskNode.active)
                return;
            let off = event.getDelta();
            this.node.x += off.x;
            this.node.y += off.y;
        }, this);

        this.node.on(cc.Node.EventType.TOUCH_END, (event) => {
            event.stopPropagation();
            this.touchEnd();
        }, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, (event) => {
            event.stopPropagation();
            this.touchEnd();
        }, this);

        this.node.on(cc.Node.EventType.TOUCH_START, (event) => {
            event.stopPropagation();
            if (!this.canClick || this.maskNode.active)
                return;
            if (this.isUsing) {
                let event = new cc.Event.EventCustom(forestComm.EventType.skillExit, true);
                event.setUserData(this);
                this.node.dispatchEvent(event);
                this.goBackToDefaultPos();
                return;
            }
            let copy = cc.instantiate(this.node);
            copy.parent = this.node.parent;
            copy.getComponent("SkillTrack").initData(this.data, this.belongType);
            copy.getComponent("SkillTrack").maskNode.active = true;
            this.lastPosNode = copy;
            let pos = this.node.parent.convertToWorldSpaceAR(this.node.position);
            this.node.position = this.gameScene.showInfoView.convertToNodeSpaceAR(pos);
            this.node.parent = this.gameScene.showInfoView;
        }, this);
    }

    // update (dt) {}
}
