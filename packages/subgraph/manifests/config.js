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
                address: "0xb8f1b78303E7eb24F89B760D1c54B8446841d64c",
                startBlock: 9068167,
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