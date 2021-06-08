module.exports.config = {
    mainnet: {
        dataSources: [
            {
                name: "GuildFactory",
                template: "GuildFactory-ds.yaml",
                address: "0x95401dc811bb5740090279Ba06cfA8fcF6113778",
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
                address: "0xa99B73A665EF495D61F32138A2cfC49526F28425",
                startBlock: 8728065,
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