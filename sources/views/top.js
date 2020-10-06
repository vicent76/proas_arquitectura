import {JetView, plugins} from "webix-jet";
import mainMenu from "views/mainMenu";
import mainToolBar from "views/mainToolbar";
import mainFooter from "views/mainFooter";



export default class TopView extends JetView{
	config(){
		var mainBody = {
			$subview: true
		};

		var ui = {
			type: "view",
			rows: [
				mainToolBar,
				{
					cols: [
						mainMenu,
						{
							view: "resizer",
							id: "resizer"
						},
						mainBody
					]
				},
				mainFooter
			]
		};

		return ui;
	}
	init(){
		
	}
}