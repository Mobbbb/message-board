export const FIRE_REACTION_COEFFICIENT = {
    label: '火蒸发',
    value: 2,
    data: 1.5,
    nature: 'F',
}

export const REACTION_COEFFICIENT = [
    {
        label: '水蒸发',
        value: 1,
        data: 2,
        nature: 'W',
    },
    {
        ...FIRE_REACTION_COEFFICIENT,
    },
    {
        label: '冰融化',
        value: 3,
        data: 1.5,
        nature: 'I',
    },
    {
        label: '火融化',
        value: 4,
        data: 2,
        nature: 'F',
    },
]

export const TEAMMATE_UNITE_BUFF = [
    {
        name: '双冰',
        value: 0,
        property: {
            type: 'percent',
            value: 15,
            key: 'critRate',
        },
    },
    {
        name: '双火',
        value: 1,
        property: {
            type: 'percent',
            value: 25,
            key: 'ATK',
        },
    },
    {
        name: '双岩',
        value: 2,
        property: {
            type: 'percent',
            value: 15,
            key: 'damageRateExtra',
        },
    },
]

export const REGION = [
    {
        label: '生之花',
        value: 'flower',
    },
    {
        label: '死之羽',
        value: 'feather',
    },
    {
        label: '时之沙',
        value: 'hourglass',
    },
    {
        label: '空之杯',
        value: 'cup',
    },
    {
        label: '理之冠',
        value: 'hat',
    },
]

export const MAIN_ATTR_MAP = {
    flower: [
        {
            label: '生命值',
            value: 'HP',
            data: 4780,
            type: 'number',
        },
    ],
    feather: [
        {
            label: '攻击力',
            value: 'ATK',
            data: 311,
            type: 'number',
        },
    ],
    hourglass: [
        {
            label: '攻击力',
            value: 'ATK',
            data: 46.6,
            type: 'percent',
        },
        {
            label: '生命值',
            value: 'HP',
            data: 46.6,
            type: 'percent',
        },
        {
            label: '元素充能效率',
            value: 'energyRate',
            data: 51.8,
            type: 'percent',
        },
        {
            label: '元素精通',
            value: 'proficiency',
            data: 187,
            type: 'number',
        },
        {
            label: '防御力',
            value: 'DEF',
            data: 58.3,
            type: 'percent',
        },
    ],
    cup: [
        {
            label: '攻击力',
            value: 'ATK',
            data: 46.6,
            type: 'percent',
        },
        {
            label: '生命值',
            value: 'HP',
            data: 46.6,
            type: 'percent',
        },
        {
            label: '火元素伤害加成',
            value: 'elementRateF',
            data: 46.6,
            type: 'percent',
        },
        {
            label: '水元素伤害加成',
            value: 'elementRateW',
            data: 46.6,
            type: 'percent',
        },
        {
            label: '冰元素伤害加成',
            value: 'elementRateI',
            data: 46.6,
            type: 'percent',
        },
        {
            label: '岩元素伤害加成',
            value: 'elementRateS',
            data: 46.6,
            type: 'percent',
        },
        {
            label: '风元素伤害加成',
            value: 'elementRateA',
            data: 46.6,
            type: 'percent',
        },
        {
            label: '雷元素伤害加成',
            value: 'elementRateE',
            data: 46.6,
            type: 'percent',
        },
        {
            label: '物理伤害加成',
            value: 'elementRateP',
            data: 46.6,
            type: 'percent',
        },
        {
            label: '防御力',
            value: 'DEF',
            data: 58.3,
            type: 'percent',
        },
        {
            label: '元素精通',
            value: 'proficiency',
            data: 187,
            type: 'number',
        },
    ],
    hat: [
        {
            label: '攻击力',
            value: 'ATK',
            data: 46.6,
            type: 'percent',
        },
        {
            label: '生命值',
            value: 'HP',
            data: 46.6,
            type: 'percent',
        },
        {
            label: '暴击率',
            value: 'critRate',
            data: 31.1,
            type: 'percent',
        },
        {
            label: '暴击伤害',
            value: 'proportionalDamage',
            data: 62.2,
            type: 'percent',
        },
        {
            label: '元素精通',
            value: 'proficiency',
            data: 187,
            type: 'number',
        },
        {
            label: '防御力',
            value: 'DEF',
            data: 58.3,
            type: 'percent',
        },
        {
            label: '治疗加成',
            value: 'treatment',
            data: 35.9,
            type: 'percent',
        },
    ],
}

export const SECONDARY_ATTR_INIT = [
    {
        key: '',
        type: 'percent',
        disabled: false,
        show: true,
    },
    {
        key: '',
        type: 'percent',
        disabled: false,
        show: true,
    },
    {
        key: '',
        type: 'percent',
        disabled: false,
        show: true,
    },
    {
        key: '',
        type: 'percent',
        disabled: false,
        show: true,
    },
]

export const SECONDARY_ATTR_ARR = [
    {
        label: '攻击力',
        value: 'ATK',
    },
    {
        label: '生命值',
        value: 'HP',
    },
    {
        label: '暴击率',
        value: 'critRate',
    },
    {
        label: '暴击伤害',
        value: 'proportionalDamage',
    },
    {
        label: '元素充能效率',
        value: 'energyRate',
    },
    {
        label: '元素精通',
        value: 'proficiency',
    },
    {
        label: '防御力',
        value: 'DEF',
    },
]

export const MONSTER_PROPERTY = {
    resistanceRateMap: {
        F: 0.1, // 火属性抗性
        W: 0.1, // 水属性抗性
        I: 0.1, // 冰属性抗性
        S: 0.1, // 土属性抗性
        A: 0.1, // 风属性抗性
        E: 0.1, // 雷属性抗性
        P: -0.2, // 物理抗性
    },
    DEF: 500,
    LEV: 90,
}

// 圣遗物装备评分表
export const SCORE_MAP = {
    胡桃: {
        percent: {
            HP: 0.5,
            ATK: 0.4,
            critRate: 2,
            proportionalDamage: 1,
        },
        number: {
            ATK: 0.02,
            proficiency: 0.18,
        },
    },
    雷电将军: {
        percent: {
            ATK: 0.55,
            critRate: 2,
            proportionalDamage: 1,
            energyRate: 0.6,
        },
        number: {
            ATK: 0.04,
        },
    },
    莫娜: {
        percent: {
            ATK: 0.55,
            critRate: 2,
            proportionalDamage: 1,
            energyRate: 0.2,
        },
        number: {
            ATK: 0.04,
        },
    },
    诺艾尔: {
        percent: {
            ATK: 0.4,
            DEF: 0.5,
            critRate: 2,
            proportionalDamage: 1,
        },
        number: {
            ATK: 0.02,
        },
    },
    荒泷一斗: {
        percent: {
            ATK: 0.4,
            DEF: 0.5,
            critRate: 2,
            proportionalDamage: 1,
        },
        number: {},
    },
    珊瑚宫心海: {
        percent: {
            ATK: 0.1,
            HP: 1,
            energyRate: 0.8,
        },
        number: {
            HP: 0.005,
            proficiency: 0.1,
        },
    },
    normal: {
        percent: {
            ATK: 0.55,
            critRate: 2,
            proportionalDamage: 1,
        },
        number: {
            ATK: 0.04,
        },
    },
    special: {
        proficiency: 0.18,
    },
}
