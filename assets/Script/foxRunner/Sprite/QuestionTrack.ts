/**
 * 问题块脚本
 */

import { skillBelongType, questionType } from "../Comm/forestEnum";
import SkillTrack from "./SkillTrack";

const { ccclass, property } = cc._decorator;

@ccclass
export default class QuestionTrack extends cc.Component {

    @property(cc.Label)
    infoLabel: cc.Label = null;

    @property(cc.Node)
    itemNode: cc.Node = null;

    /** 当前问题块的解决方案 */
    private skill: SkillTrack = null;

    public type: questionType;
    /** 归属区域的类型 */
    private belongType: skillBelongType;
    start() {

    }

    /** 添加技能块 */
    addSkill(skill: SkillTrack, bool: boolean = true) {
        if (bool) {
            if (this.skill) {
                this.skill.goBackToDefaultPos();
            }
            this.skill = skill;
        }
        else if (this.skill == skill) {
            this.skill = null;
        }
    }

    /** 清理所有子节点 */
    clearInfoNode() {
        this.skill = null;
        this.itemNode.removeAllChildren();
    }

    initData(data, belongType: skillBelongType) {
        this.belongType = belongType;
        this.type = data;
        this.infoLabel.string = data.name;
        switch (data) {
            case questionType.crashStone:
                this.infoLabel.string = "TOUCH STONE"; break;
            case questionType.crashKey:
                this.infoLabel.string = "TOUCH KEY"; break;
            case questionType.crashDoor:
                this.infoLabel.string = "TOUCH DOOR"; break;
            case questionType.crashMonster1:
                this.infoLabel.string = "MONSTER LaLa_X"; break;
            case questionType.crashMonster2:
                this.infoLabel.string = "MONSTER Dogged"; break;
            case questionType.crashMonster3:
                this.infoLabel.string = "MONSTER Chunkier"; break;
            case questionType.crashWeapon:
                this.infoLabel.string = "TOUCH WEAPON"; break;
        }
    }

    // update (dt) {}
}
