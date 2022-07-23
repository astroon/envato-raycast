import { MenuBarExtra, Icon, Color } from "@raycast/api";
import { useFetch, fullDate } from "./utils";
import dateFormat from "dateformat";

export default function Command() {
	const state = useFetch();
	let arrPay = [];
	  let array3 = [];
	  let sales = state.sales;
  return (
	<MenuBarExtra icon="https://github.githubassets.com/favicons/favicon.png" tooltip="Your Pull Requests" isLoading={state}>
		<MenuBarExtra.Item title="Sales:"/>
<MenuBarExtra.Separator />
		 {sales.map((sale, index) => (
			 <MenuBarExtra.Item title={sale.item.name} icon={{ source: Icon.BarChart, tintColor: Color.Green }} key={index} onAction={() => open("https://github.com/issues")}/>
		   ))}
	</MenuBarExtra>
  );
}