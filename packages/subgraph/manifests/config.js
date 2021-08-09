module.exports.config = {
    mainnet: {
        dataSources: [
            {
                name: "GuildFactory",
                template: "GuildFactory-ds.yaml",
                address: "",
                startBlock: 0,
            },
        ],
        templates: [
            {
                name: "GuildApp",
                template: "GuildApp-template.yaml",
            },
        ]
    },
    rinkeby: {
        dataSources: [
            {
                name: "GuildFactory",
                template: "GuildFactory-ds.yaml",
                address: "0x258Fe59eC38162AF877D6aCD782303582Dfa10BA",
                startBlock: 9085949,
            },
        ],
        templates: [
            {
                name: "GuildApp",
                template: "GuildApp-template.yaml",
            },
        ]
    },
    xdai: {
        dataSources: [
        ],
        templates: [
        ],
    },
    matic: {
        dataSources: [
        ],
        templates: [
        ],
    },
}