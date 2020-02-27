/**
 * player脚本类
 */

const { ccclass, property } = cc._decorator;
import { foxState, foxSpeed, FoxSkills, questionType } from "./Comm/forestEnum";
import forestScene from "./forestScene";
import forestComm from "./Comm/forestComm";

/** fox技能列表 */
class foxSkill {
    /** 走路 */
    public Walk = false;
    /** 跑步 */
    public Run = false;


    /** 跳跃 */
    public Jump = false;
    /** 开启门 */
    public OpenDoor = false;
    /** 捡起状态 */
    public PickUp = false;
}

@ccclass
export default class foxPlayer extends cc.Component {

    @property(cc.Animation)
    animation: cc.Animation = null;

    @property(cc.RigidBody)
    body: cc.RigidBody = null;

    @property(cc.Node)
    LHand: cc.Node = null;

    @property(cc.Node)
    RHand: cc.Node = null;

    /** 当前主角的移动速度 */
    private speed: number = 0;
    /** 当前主角的移动状态 */
    private state: foxState = foxState.None;

    /** 手里的对象 */
    private inHand = {
        keyNode: null,
        weaponNode: [],
        type: null,
    }

    private Skills: foxSkill = new foxSkill();
    private jumpingState: boolean = false;

    public mainScene: forestScene;
    public mainCamera: cc.Camera;

    start() {
        // this.Skills.Walk = true;
        this.mainScene = cc.find("Canvas").getComponent("forestScene");
        this.mainCamera = this.mainScene.camera;
    }

    init() {
        this.speed = 0;
        this.RHand.removeAllChildren();
        this.LHand.removeAllChildren();
        this.Skills = new foxSkill();
        this.inHand = {
            keyNode: null,
            weaponNode: [],
            type: null,
        }
        this.updateState(foxState.None);
    }

    /*** 发起攻击 */
    attack(callBack: Function) {
        let item = this.inHand.weaponNode.pop();
        if (item) {
            let bakState = this.state;
            this.updateState(foxState.Attack);
            item.getComponent("WeaponNode").attack(() => {
                this.updateState(bakState);
                this.state = bakState;
                callBack(true);
            });
        } else {
            console.log("dead")
            callBack(false);
        }
    }

    /** 刷新fox的状态 */
    public updateState(type: foxState) {
        if (!this.animation)
            return;
        this.state = type;
        switch (type) {
            case foxState.None:
                this.animation.play("stand");
                break;
            case foxState.Playing:
                if (this.Skills.Walk) {
                    this.speed = foxSpeed.Walk;
                    this.animation.play("walking");
                } else {
                    if (this.Skills.Run) {
                        this.speed = foxSpeed.Run;
                        this.animation.play("walking");
                    }
                }
                break;
            case foxState.Attack:
                // this.animation.play("attack");
                this.animation.play("stand");
                break;
            default: break;
        }
    }

    /** node放入手中 */
    putInHand(node, type) {
        switch (type) {
            case questionType.crashKey:
                if (this.inHand.keyNode) {
                    this.inHand.keyNode.destroy();
                }
                node.x = 0;
                node.y = 0;
                this.inHand.keyNode = node;
                node.parent = this.LHand;
                break;
            case questionType.crashWeapon:
                this.inHand.weaponNode.push(node);
                node.parent = this.RHand;
                node.x = 0;
                node.y = 0;
                break;
            default: break;
        }
    }

    useKey() {
        if (this.inHand.keyNode) {
            this.inHand.keyNode.destroy();
            this.inHand.keyNode = null;
        }
    }

    /** 手里是否存在钥匙 */
    hasKey(): boolean {
        return this.inHand.keyNode ? true : false;
    }

    /** 手里是否存在武器 */
    hasWeapon(): boolean {
        return this.inHand.weaponNode.length > 0 ? true : false;
    }

    /** 刷新技能状态 */
    updateSkills(type: FoxSkills, state: boolean) {
        switch (type) {
            case FoxSkills.Walk:
                this.Skills.Walk = state;
                this.Skills.Run = !state;
                break;
            case FoxSkills.Run:
                this.Skills.Run = state;
                this.Skills.Walk = !state;
                break;
            case FoxSkills.Jump:
                this.Skills.Jump = state;
                break;
        }
    }

    onCollisionEnter(other, self) {
        if (other.node.group == "stone") {//人物碰到石头
            let event = new cc.Event.EventCustom(forestComm.EventType.crashStone, true);
            // event.setUserData();
            event.setUserData({
                node: other.node,
                type: questionType.crashStone,
            });
            this.node.dispatchEvent(event);
        } else if (other.node.group == "door") {//人物碰到门  进入下一关
            let event = new cc.Event.EventCustom(forestComm.EventType.entryNextLevel, true);
            event.setUserData(questionType.crashDoor);
            this.node.dispatchEvent(event);
        } else if (other.node.group == "key") {//捡到钥匙
            let event = new cc.Event.EventCustom(forestComm.EventType.crashKey, true);
            event.setUserData({
                node: other.node,
                type: questionType.crashKey,
            });
            this.node.dispatchEvent(event);
        } else if (other.node.group == "monster") {//碰到怪物
            // console.log("碰到怪物", other.node.getComponent("MonsterNode").type)
            let event = new cc.Event.EventCustom(forestComm.EventType.crashMonster, true);
            event.setUserData({
                node: other.node,
                type: questionType.crashMonster + other.node.getComponent("MonsterNode").type,
            });
            this.node.dispatchEvent(event);
        } else if (other.node.group == "weapon") {//碰到怪物
            let event = new cc.Event.EventCustom(forestComm.EventType.crashWeapon, true);
            event.setUserData({
                node: other.node,
                type: questionType.crashWeapon,
            });
            this.node.dispatchEvent(event);
        }
    }

    /** 跳跃 */
    playerJump() {
        this.jumpingState = true;
        let speed = this.body.linearVelocity;
        speed.y = 600;
        this.body.linearVelocity = speed;
    }

    update(dt) {

        if (forestComm.gameState == forestComm.GameStateType.Stop || forestComm.gameState == forestComm.GameStateType.Pause)
            return;
        if (this.state != foxState.Playing)
            return;
        this.node.x += this.speed;
        this.mainCamera.node.x += this.speed;

        if (this.jumpingState) {
            let speed = this.body.linearVelocity;
            if (speed.y > -0.1 && speed.y < 0.1) {
                this.jumpingState = false;
            }
        }
    }
}
