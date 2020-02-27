/**
 * 通用默认设置类
 */


/** 自定义事件 */
let EventType = {
    crashStone: "crashStone",
    entryNextLevel: "entryNextLevel",
    skillEntry: "skillEntry",
    skillExit: "skillExit",
    crashKey: "crashKey",
    crashMonster: "crashMonster",
    crashWeapon: "crashWeapon"
}
/** 游戏状态类型 */
let GameStateType = {
    Stop: 0,
    Gaming: 1,
    Pause: 2,
}

/** 当前游戏状态 */
let gameState = GameStateType.Stop;

export default {
    EventType,
    GameStateType,
    gameState,

}