
/**
 * 狐狸快跑游戏 主场景类
 */

import foxPlayer from "./foxPlayer";
import { foxState, skillBelongType, FoxSkills, questionType, monsterType, specialEggType, endDoorType } from "./Comm/forestEnum";
import forestComm from "./Comm/forestComm";
import forestData from "./forestData";
import SkillTrack from "./Sprite/SkillTrack";
import QuestionTrack from "./Sprite/QuestionTrack";

const { ccclass, property } = cc._decorator;

cc.game.on(cc.game.EVENT_ENGINE_INITED, () => {
    let manager = cc.director.getCollisionManager();
    manager.enabled = true;
    // manager.enabledDebugDraw = true;
    let physicsManager = cc.director.getPhysicsManager();
    physicsManager.enabled = true;
    // physicsManager.debugDrawFlags = cc.PhysicsManager.DrawBits.e_jointBit | cc.PhysicsManager.DrawBits.e_shapeBit;
});

let Global = window["Global"];

@ccclass
export default class forestScene extends cc.Component {

    @property(cc.Node)
    backBtn: cc.Node = null;
    /** 开始按钮 */
    @property(cc.Node)
    startBtn: cc.Node = null;
    /** 暂停按钮 */
    @property(cc.Node)
    pauseBtn: cc.Node = null;

    @property(cc.Prefab)
    successPrefab: cc.Node = null;

    /** 怪物预设 */
    @property(cc.Prefab)
    monsterPrefab: cc.Prefab = null;


    /** 武器预设 */
    @property(cc.Prefab)
    swordPrefab: cc.Prefab = null;
    /** 所有武器的父节点 */
    @property(cc.Node)
    weaponNode: cc.Node = null;

    /** 所有怪物的父节点 */
    @property(cc.Node)
    monsterNode: cc.Node = null;

    /** player节点 */
    @property(cc.Node)
    fox: cc.Node = null;
    /** 提示文本 */
    @property(cc.Label)
    tipsLabel: cc.Label = null;
    /** 石头存放的父节点 */
    @property(cc.Node)
    stoneNode: cc.Node = null;
    /** 钥匙存放的父节点 */
    @property(cc.Node)
    keyNode: cc.Node = null;
    /** 门的坐标节点 */
    @property(cc.Node)
    endNode: cc.Node = null;

    /** 石头的预设 */
    @property(cc.Prefab)
    stone: cc.Prefab = null;
    /** 钥匙的预设 */
    @property(cc.Prefab)
    keyPrefab: cc.Prefab = null;

    @property(cc.Camera)
    camera: cc.Camera = null;

    /** 详细信息面板 */
    @property(cc.Node)
    infoLayer: cc.Node = null;
    /** 下拉按钮 */
    @property(cc.Node)
    downBtn: cc.Node = null;
    @property(cc.Node)
    downLabel: cc.Node = null;
    @property(cc.Node)
    upLabel: cc.Node = null;

    @property(cc.Node)
    staticTop: cc.Node = null;
    @property(cc.Node)
    staticBottom: cc.Node = null;

    @property(cc.Node)
    NomalTop: cc.Node = null;
    @property(cc.Node)
    NomalBottom: cc.Node = null;

    /**技能块 */
    @property(cc.Prefab)
    skillTrack: cc.Prefab = null;
    /** 问题块 */
    @property(cc.Prefab)
    questionTrack: cc.Prefab = null;
    /** 详细信息界面 */
    @property(cc.Node)
    showInfoView: cc.Node = null;

    /** 详细信息界面 */
    @property(cc.SpriteFrame)
    doorIconArr: Array<cc.SpriteFrame> = [];

    /** 玩家控制的对象 */
    private player: foxPlayer;
    /** 当前关卡的level */
    private level: number;
    /** 详细信息显示状态 */
    private showinfoState: boolean = false;
    /** 本关是否存在钥匙 */
    private DoorType: endDoorType;

    /** 静态区域存在的技能 */
    public staticObj = {
        skill: [],
    }
    /** 动态区域存在的技能 */
    public dynamicObj = {
        skill: [],
    }
    /** 定时器 */
    public timeStick: number;

    private noEndStart: boolean = false;
    private noEndTotal: number = 0;
    public specialEggType: specialEggType;
    private MonsterArr: Array<cc.Node> = [];

    start() {

        let manager = cc.director.getCollisionManager();
        manager.enabled = true;
        // manager.enabledDebugDraw = true;
        let physicsManager = cc.director.getPhysicsManager();
        physicsManager.enabled = true;

        let root = cc.find("rootNode");
        if (root) {
            root.getComponent("RootNode").addRootBtn();
        }

        forestComm.gameState = forestComm.GameStateType.Stop;

        cc.debug.setDisplayStats(false);

        this.upLabel.angle = 180;
        let level = Global ? Global.Level : 1;
        // let level = 14;
        this.initScene(level);
        this.addListener();
    }

    /** 添加默认按钮 */
    addStaticLayer(staticSkillTrack) {/** STATIC 区域 */
        if (!staticSkillTrack || staticSkillTrack.length <= 0) {
            staticSkillTrack = "1,2";
        }
        this.staticBottom.removeAllChildren();
        let arr = staticSkillTrack.split(",");
        this.staticTop.getComponent(cc.Layout).enabled = true;
        for (let i = 0; i < arr.length; i++) {
            let data = Number(arr[i]);
            let item = cc.instantiate(this.skillTrack);
            this.staticTop.addChild(item);
            item.getComponent("SkillTrack").initData(data, skillBelongType.STATIC);
        }

        setTimeout(() => {
            this.staticTop.getComponent(cc.Layout).enabled = false;
        }, 100);

        let data = {
            name: "MOVEMENT"
        }
        let question = cc.instantiate(this.questionTrack);
        question.getComponent("QuestionTrack").initData(data, skillBelongType.STATIC);
        this.staticBottom.addChild(question);
    }

    /** 添加自选区域技能块 */
    addNomalLayer(data) {
        this.NomalTop.removeAllChildren();
        this.NomalTop.getComponent(cc.Layout).enabled = true;
        if (data.nomalSkillTrack && data.nomalSkillTrack.length > 0)
            for (let item of data.nomalSkillTrack.split(",")) {
                let skill = cc.instantiate(this.skillTrack);
                skill.getComponent("SkillTrack").initData(Number(item), skillBelongType.NOMAL);
                this.NomalTop.addChild(skill);
            }
        setTimeout(() => {
            this.NomalTop.getComponent(cc.Layout).enabled = false;
        }, 100);

        if (data.nomalQuestionData && data.nomalQuestionData.length > 0)
            for (let item of data.nomalQuestionData.split(",")) {
                let skill = cc.instantiate(this.questionTrack);
                skill.getComponent("QuestionTrack").initData(Number(item), skillBelongType.NOMAL);
                this.NomalBottom.addChild(skill);
            }
    }

    initFunctionLayer(data) {
        this.addStaticLayer(data.staticSkillTrack);
        this.addNomalLayer(data);
    }

    /** 清理所有的问题块的内容 */
    clearBottomTrack() {
        for (let item of this.staticBottom.children) {
            item.getComponent("QuestionTrack").clearInfoNode();
        }
        for (let item of this.NomalBottom.children) {
            item.getComponent("QuestionTrack").clearInfoNode();
        }
    }

    /** 根据level刷新游戏界面信息 */
    initScene(level: number) {
        console.log(level)
        this.stoneNode.removeAllChildren();
        this.monsterNode.removeAllChildren();
        this.weaponNode.removeAllChildren();
        this.showInfoView.removeAllChildren();

        this.staticTop.removeAllChildren();

        this.NomalTop.removeAllChildren();
        this.NomalBottom.removeAllChildren();

        this.staticObj = {
            skill: [],
        }
        /** 动态区域存在的技能 */
        this.dynamicObj = {
            skill: [],
        }
        this.noEndTotal = 0;
        this.noEndStart = false;
        this.endNode.active = true;
        let data = forestData.levelData[level - 1];

        if (!data) {
            level = 1;
            data = forestData.levelData[level - 1];
        }

        this.level = level;
        if (data.monsterPos && data.monsterPos.length) {
            this.initMonsters(data.monsterPos);
        }
        this.initFunctionLayer(data);
        this.tipsLabel.string = data.tipsLabel;
        if (data.stoneDate)
            for (let item of data.stoneDate) {
                let pos = item.split(",");
                let stone = cc.instantiate(this.stone);
                this.stoneNode.addChild(stone);
                stone.x = Number(pos[0]);
                stone.y = Number(pos[1]);
            }

        if (data.weaponPos) {
            for (let item of data.weaponPos) {
                let wapon = cc.instantiate(this.swordPrefab);
                this.weaponNode.addChild(wapon);
                let pos = item.split(",");
                wapon.x = Number(pos[0]);
            }
        }

        this.fox.x = Number(data.startPos.split(",")[0]);
        this.fox.y = Number(data.startPos.split(",")[1]);

        this.DoorType = data.doorType;
        this.updateDoorState();
        this.specialEggType = data.specialEgg;

        if (data.keyPos) {
            let key = cc.instantiate(this.keyPrefab);
            this.keyNode.addChild(key);
            key.x = Number(data.keyPos.split(",")[0]);
            key.y = Number(data.keyPos.split(",")[1]);
        }

        if (data.doorPos) {
            this.endNode.x = Number(data.doorPos.split(",")[0]);
            // this.endNode.y = Number(data.doorPos.split(",")[1]);
        } else {
            this.endNode.active = false;
        }

        this.player = this.fox.getComponent("foxPlayer");
        this.player.node.stopAllActions();

        this.camera.node.x = 0;
        this.camera.node.y = 0;
        this.player.init();
    }

    updateDoorState() {
        this.endNode.getComponent(cc.Sprite).spriteFrame = this.doorIconArr[this.DoorType];
    }

    /** 初始化所有的怪物 */
    initMonsters(data: Array<string>) {
        this.MonsterArr = [];
        for (let item of data) {
            let info = item.split(",");
            let monster = cc.instantiate(this.monsterPrefab);
            monster.x = Number(info[1]);
            monster.y = Number(info[2]);
            monster.getComponent("MonsterNode").initData(Number(info[0]));
            this.monsterNode.addChild(monster);

            this.MonsterArr.push(monster);
        }
    }

    /** 刷新摄像机和🦊的坐标 */
    refershScene() {
        this.player.node.stopAllActions();
        this.stoneNode.removeAllChildren();
        this.weaponNode.removeAllChildren();
        this.keyNode.removeAllChildren();
        this.monsterNode.removeAllChildren();

        this.noEndStart = false;
        this.noEndTotal = 0;
        this.pauseBtn.active = false;
        this.startBtn.active = true;
        // clearTimeout(this.timeStick);
        forestComm.gameState = forestComm.GameStateType.Stop;
        let data = forestData.levelData[this.level - 1];
        this.fox.x = Number(data.startPos.split(",")[0]);
        this.fox.y = Number(data.startPos.split(",")[1]);

        // this.useTheKey = data.keyPos ? true : false;
        this.DoorType = data.doorType;

        if (data.keyPos) {
            let key = cc.instantiate(this.keyPrefab);
            this.keyNode.addChild(key);
            key.x = Number(data.keyPos.split(",")[0]);
            key.y = Number(data.keyPos.split(",")[1]);
        }

        if (data.monsterPos && data.monsterPos.length) {
            this.initMonsters(data.monsterPos);
        }
        if (data.weaponPos) {
            for (let item of data.weaponPos) {
                let wapon = cc.instantiate(this.swordPrefab);
                this.weaponNode.addChild(wapon);
                let pos = item.split(",");
                wapon.x = Number(pos[0]);
            }
        }
        if (data.stoneDate)
            for (let item of data.stoneDate) {
                let pos = item.split(",");
                let stone = cc.instantiate(this.stone);
                this.stoneNode.addChild(stone);
                stone.x = Number(pos[0]);
                stone.y = Number(pos[1]);
            }


        this.camera.node.x = 0;
        this.camera.node.y = 0;

        if (this.player) {
            this.player.init();
            for (let item of this.staticObj.skill) {
                this.player.updateSkills(item.type, true);
            }
            for (let item of this.dynamicObj.skill) {
                this.player.updateSkills(item.type, true);
            }
        }
    }

    /** 下拉按钮点击 */
    downBtnClick() {
        this.infoLayer.stopAllActions();
        let y = this.infoLayer.y - this.infoLayer.height;
        if (!this.showinfoState) {
            this.showinfoState = true;
            this.upLabel.active = true;
            this.downLabel.active = false;
        } else {
            this.showinfoState = false;
            y = this.infoLayer.y + this.infoLayer.height;
            this.upLabel.active = false;
            this.downLabel.active = true;
        }
        let ani = cc.moveTo(0.5, 0, y);
        this.infoLayer.runAction(ani);
    }

    /** 判断技能是否可以放进技能栏里 */
    checkNodeInTrack(skill: SkillTrack) {
        let pos1 = skill.node.position;
        switch (skill.belongType) {
            case skillBelongType.STATIC:
                let staticBot = this.staticBottom.children[0].getComponent("QuestionTrack").itemNode;
                let toW = staticBot.parent.convertToWorldSpaceAR(staticBot.position)
                let pos2 = this.showInfoView.convertToNodeSpaceAR(toW);
                if (Math.abs(pos1.x - pos2.x) < 100 && Math.abs(pos1.y - pos2.y) < 50) {
                    this.staticBottom.children[0].getComponent("QuestionTrack").addSkill(skill);
                    skill.node.parent = staticBot;
                    skill.node.x = 0;
                    skill.node.y = 0;
                    skill.isUsing = true;
                    this.staticObj.skill.push(skill);
                    this.refershScene();
                } else {
                    skill.goBackToDefaultPos();
                }
                break;
            case skillBelongType.NOMAL:
                let flag = false;
                for (let item of this.NomalBottom.children) {
                    let staticBot = item.getComponent("QuestionTrack").itemNode;
                    let toW = staticBot.parent.convertToWorldSpaceAR(staticBot.position)
                    let pos2 = this.showInfoView.convertToNodeSpaceAR(toW);
                    if (Math.abs(pos1.x - pos2.x) < 100 && Math.abs(pos1.y - pos2.y) < 50) {
                        item.getComponent("QuestionTrack").addSkill(skill);
                        skill.node.parent = staticBot;
                        skill.node.x = 0;
                        skill.node.y = 0;
                        skill.isUsing = true;
                        this.dynamicObj.skill.push(skill);
                        this.refershScene();
                        flag = true;
                        break;
                    }
                }
                if (!flag)
                    skill.goBackToDefaultPos();
                break;
            default: break;
        }
    }

    /** 监听触发器 */
    ListenerTrigger(type, callFunc: Function, node?: cc.Node) {
        let flag = false;
        let needCallBack = true;
        for (let item of this.NomalBottom.children) {
            let obj = item.getComponent("QuestionTrack");
            if (obj.type != type)
                continue;
            // console.log(obj.type, " - ", type)
            if (!obj.skill)
                continue;
            switch (obj.skill.type) {
                case FoxSkills.Jump:
                    console.log("jump")
                    if (type == questionType.crashStone || type == questionType.crashDoor || type == questionType.crashWeapon) {//碰到门或者石头
                        flag = true;
                        this.player.playerJump();
                    } else if (type >= questionType.crashMonster1) {//是怪物类型
                        if (node) {
                            let ty = node.getComponent("MonsterNode").type;
                            console.log("type", ty)
                            if (ty == monsterType.CanJumpKill || ty == monsterType.CanJump) {
                                flag = true;
                                this.player.playerJump();
                            }
                        }
                    }
                    break;
                case FoxSkills.OpenDoor:
                    if (type == questionType.crashDoor) {
                        if (this.DoorType == endDoorType.NomalType) {
                            this.level++;
                            this.successLevel(this.level);
                        } else if (this.DoorType == endDoorType.LockedType) {
                            if (this.initScene && this.level) {
                                if (this.player.hasKey()) {
                                    this.player.useKey();
                                    this.level++;
                                    this.successLevel(this.level);
                                }
                            }
                        } else if (this.DoorType == endDoorType.SoftType) {
                            if (this.initScene && this.level) {
                                if (!this.player.hasWeapon()) {
                                    this.level++;
                                    this.successLevel(this.level);
                                } else {
                                    this.refershScene();
                                }
                            }
                        }
                    }
                    break;
                case FoxSkills.PickUp:
                    if (type == questionType.crashKey || type == questionType.crashWeapon) {
                        if (node)
                            this.player.putInHand(node, type);
                    }
                    break;
                case FoxSkills.Attack:
                    console.log("attack")
                    if (type >= questionType.crashMonster1) {
                        needCallBack = false;
                        console.log(node.getComponent("MonsterNode").type, "type")
                        this.player.attack((bool) => {
                            if (bool && node && node.getComponent("MonsterNode").type != monsterType.CanJump) {
                                node.getComponent("MonsterNode").dead();
                                this.MonsterIsDead(node);
                            } else {
                                this.refershScene();
                            }
                        });
                    } else if (type == questionType.crashStone) {
                        needCallBack = false;
                        this.player.attack((bool) => {
                            if (bool && node) {
                                node.destroy();
                            } else {
                                this.refershScene();
                            }
                        });
                    }
                    break;
            }
        }
        if (needCallBack && callFunc && typeof callFunc == "function")
            callFunc(flag);
    }

    /** 当怪物死亡之后 判断是否需要出发彩蛋 */
    MonsterIsDead(node) {
        let index = this.MonsterArr.indexOf(node);
        this.MonsterArr.splice(index, 1);
        if (this.specialEggType == specialEggType.MonsterEgg) {
            console.log("special Egg")
            for (let item of this.MonsterArr) {
                item.getComponent("MonsterNode").exchangeForm();
            }
        }
    }

    /** 通过本关 */
    successLevel(level) {
        this.pauseBtn.active = false;
        this.startBtn.active = true;
        clearTimeout(this.timeStick);

        this.showInfoView.addChild(cc.instantiate(this.successPrefab));
        this.player.animation.stop();
        forestComm.gameState = forestComm.GameStateType.Stop;
        // completeLevel();

        setTimeout(() => {
            this.level++;
            this.initScene(this.level);
        }, 2000);
    }

    addListener() {

        this.backBtn.on(cc.Node.EventType.TOUCH_END, () => {
            cc.director.loadScene("AlajaScene");
        }, this);

        this.startBtn.on(cc.Node.EventType.TOUCH_END, () => {
            if (this.showinfoState) {
                this.showinfoState = false;
                let y = this.infoLayer.y - this.infoLayer.height;
                y = this.infoLayer.y + this.infoLayer.height;
                this.upLabel.active = false;
                this.downLabel.active = true;
                let ani = cc.moveTo(0.5, 0, y);
                this.infoLayer.runAction(ani);
            }
            forestComm.gameState = forestComm.GameStateType.Gaming;
            if (this.player)
                this.player.updateState(foxState.Playing);
            if (!this.endNode.active) {
                this.noEndStart = true;
            }

            this.startBtn.active = false;
            this.pauseBtn.active = true;
        }, this);

        this.pauseBtn.on(cc.Node.EventType.TOUCH_END, () => {
            this.player.animation.stop();
            this.noEndStart = false;
            this.pauseBtn.active = false;
            this.startBtn.active = true;
            forestComm.gameState = forestComm.GameStateType.Pause;
        }, this);

        /** 碰撞石头 */
        this.node.on(forestComm.EventType.crashStone, (event) => {
            event.stopPropagation();
            let data = event.getUserData();
            this.ListenerTrigger(data.type, (flag) => {//失败回调
                if (!flag) {
                    this.refershScene();
                    console.log("crashStone dead")
                }
            }, data.node);
        });

        /** 碰撞钥匙 */
        this.node.on(forestComm.EventType.crashKey, (event) => {
            event.stopPropagation();
            let data = event.getUserData();
            this.ListenerTrigger(data.type, (flag) => {

            }, data.node);
        });

        /** 碰撞武器 */
        this.node.on(forestComm.EventType.crashWeapon, (event) => {
            event.stopPropagation();
            let data = event.getUserData();
            this.ListenerTrigger(data.type, (flag) => {

            }, data.node);
        });

        /** 碰撞怪物 */
        this.node.on(forestComm.EventType.crashMonster, (event) => {
            event.stopPropagation();
            let data = event.getUserData();
            this.ListenerTrigger(data.type, (flag) => {
                if (!flag)
                    this.refershScene();
            }, data.node);
        });

        /** 碰撞门 */
        this.node.on(forestComm.EventType.entryNextLevel, (event) => {
            event.stopPropagation();
            let type = event.getUserData();
            this.timeStick = setTimeout(() => {
                this.refershScene();
            }, 2000);
            this.ListenerTrigger(type, (flag) => {

            });
        });

        /** 放入技能 */
        this.node.on(forestComm.EventType.skillEntry, (event) => {
            event.stopPropagation();
            let skill = event.getUserData();
            this.checkNodeInTrack(skill);
        });

        /** 技能放出 */
        this.node.on(forestComm.EventType.skillExit, (event) => {
            event.stopPropagation();
            let skill = event.getUserData();
            let arr = this.NomalBottom.children;
            let skillArr = this.dynamicObj.skill;
            if (skill.belongType == skillBelongType.STATIC) {
                arr = this.staticBottom.children;
                skillArr = this.staticObj.skill;
            }

            for (let item of arr) {
                item.getComponent("QuestionTrack").addSkill(skill, false);
            }
            let index = skillArr.indexOf(skill);
            skillArr.splice(index, 1);

            this.refershScene();
        });


        this.downBtn.on(cc.Node.EventType.TOUCH_END, () => {
            this.downBtnClick();
        }, this);
    }

    update(dt) {
        if (this.noEndStart) {
            this.noEndTotal += dt;
            if (this.noEndTotal >= 4) {
                this.noEndStart = false;
                this.noEndTotal = 0;
                this.level++;
                this.successLevel(this.level);
            }
        }
    }
}
