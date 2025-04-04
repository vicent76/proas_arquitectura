import "./styles/app.css";
import {JetApp, EmptyRouter, HashRouter, plugins } from "webix-jet";
import "regenerator-runtime/runtime";


export default class MyApp extends JetApp{
	constructor(config){
		const defaults = {
			id 		: APPNAME,
			version : VERSION,
			router 	: BUILD_AS_MODULE ? EmptyRouter : HashRouter,
			debug 	: !PRODUCTION,
			start 	: "/login"
		};

		super({ ...defaults, ...config });
	}
}

if (!BUILD_AS_MODULE){
	webix.ready(() => {
		var app = new MyApp();
		app.use(plugins.Locale);
		app.use(plugins.Theme);
		webix.i18n.setLocale("es-ES");
		app.render();
		app.getService("theme").setTheme('compact-default');
	});
}