import {
  ActionPanel,
  getPreferenceValues,
  List,
  OpenInBrowserAction,
  showToast,
  ToastStyle,
  Detail,
  Icon,
  Color,
} from "@raycast/api";
import { useState, useEffect } from "react";
import Envato from "envato";
import dateFormat from "dateformat";

const token = getPreferenceValues().token;
const date = new Date();
const day = date.getDate();
const month = date.getMonth() + 1;
const year = date.getFullYear();
const fullDate = `${day}, ${month}, ${year}`;

type envatoErrors = {
  empty?: boolean;
  reason?: string;
  description?: string;
};

type envatoUser = {
  username?: string;
  sales?: string;
  image?: string;
};

export default function Command() {
  const [state, setState] = useState<{ account: []; user: envatoUser; sales: []; errors: envatoErrors }>({ account: [], user: [] as envatoUser, sales: [], errors: [] as envatoErrors });

  useEffect(() => {
	async function fetch() {
	  try {
		const client = Envato !== undefined ? new Envato.Client(token) : undefined;
		const username = client !== undefined ? await client.private.getUsername() : "";
		const userInfo = client !== undefined ? await client.user.getAccountDetails(username) : [];
		const accountInfo = client !== undefined ? await client.private.getAccountDetails() : [];
		const salesInfo = client !== undefined ? await client.private.getSales() : [];
		const salesEmpty: any = salesInfo.length === 0 ? { empty: true } : [];
		setState((oldState) => ({
		  ...oldState,
		  sales: salesInfo as [],
		  user: userInfo as envatoUser,
		  account: accountInfo as [],
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
	fetch();
  }, []);

  if (state.errors.reason !== undefined && state.errors.empty !== true) {
	return (
	  <Detail markdown={`# 😢 ${state.errors.reason ?? ""} \n \`\`\`\n${state.errors.description ?? ""}\n\`\`\``} />
	);
  }

  function price(price: "", support: "") {
	let support_out = "";
	if (parseInt(support) != 0) {
	  support_out = " ($" + support + ")";
	}
	return "$" + price + support_out;
  }

  function SaleItem(props: { sale: any; key: number }) {
	return (
	  <List.Item
		icon={props.sale.item.previews.icon_preview.icon_url ?? "/"}
		title={String(props.sale.item.name ?? "")}
		subtitle={String(dateFormat(props.sale.sold_at, "dd.mm.yyyy")) ?? ""}
		accessories={[
		  { text: `${price(props.sale.amount, props.sale.support_amount)}`, icon: Icon.List },
		]}
		actions={
		  <ActionPanel>
			<OpenInBrowserAction url={`${props.sale.item.url}`} />
		  </ActionPanel>
		}
	  />
	);
  }
  function Account(props: { infoUser: any; infoAccount: any;}) {
	return (
	<List.Item
	  icon={props.infoUser.image ?? "/"}
	  title={String(`${props.infoUser.username}` ?? "")}
	  subtitle={String(`${props.infoAccount.firstname} ${props.infoAccount.surname}`) ?? ""}
	  accessories={[
		{ text: `${props.infoUser.sales}`, icon: { source: Icon.Calendar, tintColor: Color.Green } },
		{ text: `$${props.infoAccount.balance}`, icon: { source: Icon.List, tintColor: Color.Green } },
	  ]}
	/>
  );
  }

  return (
	<List isLoading={state.sales.length === 0 && state.errors.reason == undefined && state.errors.empty !== true}>
	  <List.Section title="Account">
		  {state.user.username === "" ||  state.user.username == undefined ? (
			  <List.EmptyView
				icon={{ source: Icon.Person }}
				title="Loading..."
			  />
			) : (
			  <Account infoUser={state.user} infoAccount={state.account}/>
		   )}
	  </List.Section>
	  <List.Section title="Today">
		{state.sales.map((sale, index) => {
		  const saleDate = String(dateFormat(sale["sold_at"], "dd, mm, yyyy"));
		  if (saleDate == fullDate && state.errors !== []) return <SaleItem sale={sale} key={index} />;
		})}
	  </List.Section>
	  <List.Section title="Sales">
		  {state.user.username === "" ||  state.user.username == undefined ? (
				<List.EmptyView
				  icon={{ source: Icon.TwoArrowsClockwise }}
				  title="Loading..."
				/>
			  ) : (
				state.sales.map((sale, index) => {
				  const saleDate = String(dateFormat(sale["sold_at"], "dd, mm, yyyy"));
				  if (saleDate != fullDate && state.errors !== []) return <SaleItem sale={sale} key={index} />;
				})
			 )}
	  </List.Section>
	</List>
  );
}
