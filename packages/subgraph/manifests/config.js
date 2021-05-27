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
                address: "0x4372Bff493245729E484Ed858e0D6F2C4fe715C7",
                startBlock: 8656340,
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