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
                address: "0x9f9901d6797726bbC9623EEB6030F2ebD62596B5",
                startBlock: 8932841,
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