/* eslint-disable */
export default {
    "CHARACTERS": [
        {
            "name": "荒泷一斗", 
            "HP": 12858, 
            "ATK": 227, 
            "DEF": 959, 
            "critRate": 24.2, 
            "proportionalDamage": 50, 
            "HPPercent": 0,
            "ATKPercent": 0, 
            "DEFPercent": 0,
            "elementRateF": 0, 
            "elementRateW": 0, 
            "elementRateI": 0, 
            "elementRateS": 0, 
            "elementRateA": 0, 
            "elementRateE": 0, 
            "elementRateP": 0, 
            "proficiency": 0, 
            "energyRate": 100, 
            "nature": "S", 
            "weaponType": "claymore", 
            "star": 5, 
            "avatar": "/resource/genshin-equipment/image/hlyd.png", 
            "activeSkills": [
                {
                    "name": "逆袈裟连斩", 
                    "multiplyingRate": 180.2, 
                    "type": "N", 
                    "damageNature": ["S"]
                }
            ], 
            "passiveSkills": [
                {
                    "name": "元素爆发", 
                    "property": [
                        {
                            "type": "percent", 
                            "value": 103.7, 
                            "key": "DEFToATK"
                        }
                    ],
                    "actived": true
                },
                {
                    "name": "赤鬼之血", 
                    "property": [
                        {
                            "type": "percent", 
                            "value": 35, 
                            "key": "DEFToOriginalDamageExtra",
                            "damageTypeLimited": ["N"]
                        }
                    ],
                    "actived": true,
                    "msg": "逆袈裟造成的伤害提高，伤害提高值基于荒泷一斗防御力的35%"
                }
            ], 
            "duplicateNumSkills": [
                {
                    "index": 3, 
                    "property": [
                        {
                            "type": "percent", 
                            "value": 100, 
                            "key": "extraMultiplyingRateE"
                        }
                    ]
                }, 
                {
                    "index": 5, 
                    "property": [
                        {
                            "type": "percent", 
                            "value": 18.7, 
                            "key": "DEFToATK"
                        }
                    ]
                }, 
                {
                    "index": 6, 
                    "property": [
                        {
                            "type": "percent", 
                            "value": 70, 
                            "key": "proportionalDamage",
                            "damageTypeLimited": ["N"]
                        }
                    ]
                }
            ]
        }, 
        {
            "name": "胡桃", 
            "HP": 15552, 
            "ATK": 107, 
            "DEF": 876, 
            "critRate": 5, 
            "proportionalDamage": 88.4, 
            "HPPercent": 0,
            "ATKPercent": 0, 
            "DEFPercent": 0,
            "elementRateF": 0, 
            "elementRateW": 0, 
            "elementRateI": 0, 
            "elementRateS": 0, 
            "elementRateA": 0, 
            "elementRateE": 0, 
            "elementRateP": 0, 
            "proficiency": 0, 
            "energyRate": 100, 
            "nature": "F", 
            "weaponType": "spear", 
            "star": 5, 
            "avatar": "/resource/genshin-equipment/image/hutao.png", 
            "activeSkills": [
                {
                    "name": "重击", 
                    "multiplyingRate": 242.6, 
                    "type": "N", 
                    "damageNature": [
                        "F", 
                        "P"
                    ]
                }, 
                {
                    "name": "元素爆发", 
                    "multiplyingRate": 617, 
                    "type": "Q", 
                    "damageNature": [
                        "F"
                    ]
                }
            ], 
            "passiveSkills": [
                {
                    "name": "元素战技", 
                    "property": [
                        {
                            "type": "percent", 
                            "value": 6.26, 
                            "key": "HPToATK"
                        }
                    ],
                    "actived": true
                }, 
                {
                    "name": "血之灶火", 
                    "property": [
                        {
                            "type": "percent", 
                            "value": 33, 
                            "key": "elementRateF",
                            editable: true,
                        }
                    ],
                    "actived": true, 
                    "msg": "生命值低于50%时，获得33%火伤加成"
                }, 
                {
                    "name": "测试被动", 
                    "property": [
                        {
                            "type": "percent", 
                            "value": 33, 
                            "key": "DEF"
                        },
                        {
                            "type": "percent", 
                            "value": 33, 
                            "key": "DEF",
                            editable: true,
                        },
                    ],
                    "actived": true, 
                    "msg": "生命值低于50%时，获得33%火伤加成"
                }
            ], 
            "duplicateNumSkills": [
                {
                    "index": 1, 
                    "property": [
                        {
                            "type": "percent", 
                            "value": 89, 
                            "key": "energyRate",
                            hierarchyNum: 2,
                            max: 2,
                        }
                    ]
                },
                {
                    "index": 3, 
                    "passiveSkills": "元素战技",
                    "property": [
                        {
                            "type": "percent", 
                            "value": 0.89, 
                            "key": "HPToATK"
                        }
                    ]
                },  
                {
                    "index": 5, 
                    "property": [
                        {
                            "type": "percent", 
                            "value": 89, 
                            "key": "extraMultiplyingRateQ"
                        }
                    ]
                }
            ]
        },
    ],
    "WEAPONS": [
        {
            "name": "赤角石溃杵", 
            "ATK": 542, 
            "type": "claymore", 
            "secondaryAttr": [
                {
                    "type": "percent", 
                    "value": 88.2, 
                    "key": "proportionalDamage"
                }, 
                {
                    "type": "percent", 
                    "value": 28, 
                    "key": "DEF", 
                    "levelRate": 7
                }, 
                {
                    "type": "percent", 
                    "value": 40, 
                    "key": "DEFToOriginalDamageExtra", 
                    "levelRate": 10,
                    "damageTypeLimited": ["A", "N"]
                }
            ]
        },
        {
            "name": "护摩之杖", 
            "ATK": 608, 
            "type": "spear", 
            "secondaryAttr": [
                {
                    "type": "percent", 
                    "value": 66.2, 
                    "key": "proportionalDamage"
                }, 
                {
                    "type": "percent", 
                    "value": 1.8, 
                    "key": "HPToATK", 
                    "levelRate": 0.4,
                },
                {
                    "type": "percent", 
                    "value": 20, 
                    "key": "HP", 
                    "levelRate": 5
                },
                {
                    "type": "percent", 
                    "value": 20, 
                    "key": "energyRate", 
                    "levelRate": 5,
                    hierarchyNum: 2,
                    max: 5,
                },
            ]
        }, 
    ],
    "COORDINATES": [
        {
            "2": [
                {
                    "type": "percent", 
                    "value": 15, 
                    "key": "elementRateF"
                }
            ], 
            "4": [
                {
                    "type": "percent", 
                    "value": 7.5, 
                    "key": "elementRateF", 
                    "editable": true
                }, 
                {
                    "type": "percent", 
                    "value": 15, 
                    "key": "reactionRateExtra"
                }
            ], 
            "image": "/resource/genshin-equipment/image/monv.png", 
            "name": "炽烈的炎之魔女", 
            "value": "MONV"
        },
        {
            "2": [], 
            "4": [
                {
                    "type": "percent", 
                    "value": 7.5, 
                    "key": "elementRateF",
                }, 
                {
                    "type": "percent", 
                    "value": 15, 
                    "key": "reactionRateExtra", 
                    "editable": true,
                }
            ], 
            "image": "/resource/genshin-equipment/image/monv.png", 
            "name": "测试", 
            "value": "  CESHI"
        },
    ],
    "TEAMMATE": [
        {
            "name": "申鹤", 
            "nature": "I", 
            "secondaryAttr": [
                {
                    "type": "number", 
                    "value": 3648, 
                    "key": "originalDamageExtra", 
                    "damageNatureLimited": ["I"], 
                    "editable": true
                }
            ], 
            "msg": "原始伤害加成=元素战技加成百分比 * 申鹤攻击力。以4000攻击力/10级技能为例，即82.2% * 4000 = 3288"
        },
    ],
}