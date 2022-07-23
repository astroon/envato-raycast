import {
  ActionPanel, Action, List,
  getPreferenceValues, OpenInBrowserAction,
  showToast, ToastStyle,
  Detail, Icon, Color, environment, updateCommandMetadata
} from "@raycast/api";
import { useState, useEffect } from "react";
import { envatoErrors, envatoUser, saleItem, saleItemMeta, wpThemeMetadata, previewsItem } from "./types";
import Envato from "envato";
const token = getPreferenceValues().token;

const date = new Date();
const day = date.getDate();
const month = date.getMonth() + 1;
const year = date.getFullYear();
export const fullDate = `${day}, ${month}, ${year}`;

export const useFetch = () => {
	const [state, setState] = useState<{ showdetail: Boolean; account: []; user: envatoUser; portfolio: []; sales: saleItem; badges: []; statement: []; errors: envatoErrors }>({ showdetail: false, account: [], user: [] as envatoUser, portfolio: [], sales: [] as saleItem, badges: [], statement: [], errors: [] as envatoErrors });
	
	async function fetch() {
	  try {
		const client = Envato !== undefined ? new Envato.Client(token) : undefined;
		const username = client !== undefined ? await client.private.getUsername() : "";
		const userInfo = client !== undefined ? await client.user.getAccountDetails(username) : [];
		const accountInfo = client !== undefined ? await client.private.getAccountDetails() : [];
		const badges = client !== undefined ? await client.user.getBadges(username) : [];
		const portfolio = client !== undefined ? await client.catalog.searchItems({ username: username}) : [];
		const salesInfo = client !== undefined ? await client.private.getSales() : [];
		const statement = client !== undefined ? await client.private.getStatement({}) : [];
		const salesEmpty: any = salesInfo.length === 0 ? { empty: true } : [];
		console.log(statement);
		console.log(salesInfo);
		setState((oldState) => ({
		  ...oldState,
		  sales: salesInfo as saleItem,
		  statement: statement as [],
		  user: userInfo as envatoUser,
		  badges: badges as [],
		  account: accountInfo as [],
		  portfolio: portfolio as [],
		  errors: salesEmpty as envatoErrors,
		}));
	  } catch (error: any) {
		let reason = "Error";
		let description = "An unknown error has occurred.";
		if (error.response !== undefined){
			reason = error.response.reason ?? reason;
			description = error.response.error ?? description;
		}
		const out: { [key: string]: any } = { reason, description };
		setState((oldState) => ({
		  ...oldState,
		  errors: out as envatoErrors,
		}));
		showToast(ToastStyle.Failure, reason, description);
		return;
	  }
	}

	useEffect(() => {
		fetch();
	}, []);
	
	return state;
}


{/* export default async function main() {
  console.log("launchType", environment.launchType);
  const count = await fetchUnreadNotificationCount();
  await updateCommandMetadata({ subtitle: `Unread Notifications: ${count}` });
} */}