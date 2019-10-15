/* eslint-disable no-undef */

/** 
 * Set the difficulty for mining. 
 * @const {number}
*/
const DIFFICULTY = 4;

/** 
 * Initial amount of the wallet
 * @const {number} 
 */
const MINE_RATE = 3000;
/**
 * Initial amount of the wallet
 * @const {number}
 */
const INITIAL_BALANCE = 0;
/** 
 * Amount of the reward for mining
 * @const {number}  
*/
const MINING_REWARD = 50;

/** 
 * Amount of coin base 
 * @const {number}  
*/
const COIN_BASE_BALANCE = 99999

/** 
 * configuration file
 * @exports config
 */
module.exports = { DIFFICULTY, MINE_RATE, INITIAL_BALANCE, MINING_REWARD, COIN_BASE_BALANCE }