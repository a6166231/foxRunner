/**
 * 枚举类
 */

export enum foxSpeed {
    /** 走路的速度 */
    Walk = 3,
    /** 跑步的速度 */
    Run = 5,
}
export enum foxState {
    /** 无状态 */
    None = 1,
    /** 跑 */
    Playing = 3,
    /** 攻击 */
    Attack = 4,
}
/** 技能归属区域 */
export enum skillBelongType {
    /** 默认静态区域 */
    STATIC = "STATIC",
    /** 随关卡变化区域 */
    NOMAL = "NOMAL",
}

/** 问题块 */
export enum questionType {
    /** 碰撞石头 */
    crashStone = 1,
    /** 碰撞钥匙 */
    crashKey = 2,
    /** 碰撞门 */
    crashDoor = 3,
    /** 碰撞武器 */
    crashWeapon = 4,



    /** 碰撞怪物 */
    crashMonster = 10,
    crashMonster1 = 11,
    crashMonster2 = 12,
    crashMonster3 = 13,

}

/** 所有技能类型 */
export enum FoxSkills {
    /** 走 */
    Walk = 1,
    /** 跑 */
    Run = 2,


    /** 跳 */
    Jump = 3,
    /** 捡起 */
    PickUp = 4,
    /** 开门 */
    OpenDoor = 5,

    /** 发起攻击 */
    Attack = 10,
}

/** 怪物类型 */
export enum monsterType {
    /** 可跳跃可击杀 */
    CanJumpKill = 1,
    /** 可跳跃 */
    CanJump = 2,
    /** 可击杀 */
    CanKill = 3,

    /** 4 */
    CanKill_2 = 4,
}

/** 彩蛋类型 */
export enum specialEggType {
    /** 怪物的彩蛋 */
    MonsterEgg = 1,
}

/** 门的类型 */
export enum endDoorType {
    /** 不需要钥匙的门  即开即用 */
    NomalType = 0,
    /** 要钥匙的门 */
    LockedType = 1,
    /** 安检门 不要钥匙 但是不能携带武器 */
    SoftType = 2,
}