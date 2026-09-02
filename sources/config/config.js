import packcage from '../../package.json'

export const devConfig = {
    getConfig: () => {
        return new Promise((success, fail) => {
            if (!PRODUCTION) {
                return success({
                    urlApi: "http://localhost:8088",
                    //urlClient: "http://localhost:8089",
                    //one_push_url: "https://onesignal.com/api/v1/notifications",
                    //one_app_id: "ff4726ef-84ad-448d-ac78-b4beecf02f0b",
                    //one_api_key: "Yzk2ZWY5NTctOWQ2Yi00ZTc5LTk5NzItOTI1NTVlYzdlZGU5"
                });
            }
            webix.ajax()
                .timeout(10000)
                .headers({
                    "Content-Type": "application/json"
                })
                .get("/config")
                .then((result) => {
                    success(result.json());
                })
                .catch((inXhr) => {
                    fail(inXhr);
                });
        });
    },

    getConfigMysql: () => {
        return new Promise((success, fail) => {
            if (!PRODUCTION) {
                return success({
                    report: {
                        "host": "localhost",
                        "user": "root",
                        "password": "aritel",
                        "database": "proasistencia",
                        "port": 3306,
                        "stiUrl": "http://localhost:5001"
                    }
                });
            } else {
                webix.ajax()
                .timeout(10000)
                .headers({
                    "Content-Type": "application/json"
                })
                .get("/config")
                .then((result) => {
                    success(result.json());
                })
                .catch((inXhr) => {
                    fail(inXhr);
                });
            }
        });
    },
    getVersion: () => {
        return new Promise((success, fail) => {
            if (!PRODUCTION) {
                return success({
                    version: packcage.version
                });
            }
            webix.ajax()
                .timeout(10000)
                .headers({
                    "Content-Type": "application/json"
                })
                .get("/version")
                .then((result) => {
                    success(result.json());
                })
                .catch((inXhr) => {
                    fail(inXhr);
                });
        });
    }
}

