import {
  ActionPanel,
  Action,
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

type saleItem = {
	item?: saleItemMeta;
	amount?: Number = 0;
	support_amount?: Number = 0;
	previews?: previewsItem;
};

type saleItemMeta = {
  wordpress_theme_metadata?: [];
  url: [];
};


type previewsItem = { 
	icon_with_landscape_preview?: String = "";
};

export default function Command() {
  const [state, setState] = useState<{ showdetail: Boolean; account: []; user: envatoUser; portfolio: []; sales: saleItem; errors: envatoErrors }>({ showdetail: false, account: [], user: [] as envatoUser, portfolio: [], sales: [] as saleItem, errors: [] as envatoErrors });

  useEffect(() => {
	async function fetch() {
	  try {
		const client = Envato !== undefined ? new Envato.Client(token) : undefined;
		const username = client !== undefined ? await client.private.getUsername() : "";
		const userInfo = client !== undefined ? await client.user.getAccountDetails(username) : [];
		const accountInfo = client !== undefined ? await client.private.getAccountDetails() : [];
		const portfolio = client !== undefined ? await client.catalog.searchItems({ username: username}) : [];
		const salesInfo = client !== undefined ? await client.private.getSales() : [];
		const salesEmpty: any = salesInfo.length === 0 ? { empty: true } : [];
		setState((oldState) => ({
		  ...oldState,
		  sales: salesInfo as saleItem,
		  user: userInfo as envatoUser,
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
	  support_out = " + $" + support + "";
	}
	return "$" + price + support_out;
  }
  function AccountPortfolio(props: { portfolio: any}) {

  return <List isLoading={props.portfolio.length === 0}>
		<List.Section title="My Portfolio">
			{ props.portfolio.matches.map((item, index) => {
					return <PortfolioItem item={item} key={index}/>;
				  })}
		</List.Section>
	  </List>
  }
  
  function PortfolioItem(props: { item: saleItem; key: number;}) {
	  const accessories = [{text: `${props.item.number_of_sales} Purchases`}, {text: `${props.item.rating.rating} (${props.item.rating.count})`, icon: { source: Icon.Star, tintColor: Color.Yellow }}]
	  const icon = props.item.previews.icon_with_landscape_preview.icon_url ?? "/";
	  const title = props.item.name ?? "/";
  
	  return (
		<List.Item
		  icon={icon ?? "/"}
		  title={String(title ?? "")}
		  subtitle={String(dateFormat(props.item.updated_at, "dd.mm.yyyy")) ?? ""}
		  accessories={accessories}
		  actions={
			<ActionPanel>
				<Action.Push title="Details" target={<SaleItemDetail sale={props.item} todey={false}/>} />
			</ActionPanel>
		  }
		/>
	  );
	}
  
  function SaleItemDetail(props: { sale: saleItem; todey: Boolean}) {
  	  const theme_name = props.sale.item.wordpress_theme_metadata !== undefined ? "- **Theme Name:** " + props.sale.item.wordpress_theme_metadata.theme_name : "";
	  const author_name = props.sale.item.wordpress_theme_metadata !== undefined ? "- **Author Name:** " + props.sale.item.wordpress_theme_metadata.author_name : "";
      const version = props.sale.item.wordpress_theme_metadata !== undefined ? "- **Version:** " + props.sale.item.wordpress_theme_metadata.version : "";
	  const description = props.sale.item.wordpress_theme_metadata !== undefined ? "- **Description:** " + props.sale.item.wordpress_theme_metadata.description : "";
	  const markdown = `# ${props.sale.item.name}
![illustration](${props.sale.item.previews.icon_with_landscape_preview.landscape_url})
${theme_name}
${author_name}
${version}
${description}`;

	return <Detail markdown={markdown} 
	  navigationTitle={props.sale.item.name} 
	  metadata={
		  <Detail.Metadata>
			<Detail.Metadata.TagList title="Amount">
				<Detail.Metadata.TagList.Item text={`$ ${props.sale.amount}`} color={Color.Green} />
			</Detail.Metadata.TagList>
			<Detail.Metadata.TagList title="Support Amount"> 
				<Detail.Metadata.TagList.Item text={`$ ${props.sale.support_amount}`} color={Color.Blue} />
			</Detail.Metadata.TagList>
			<Detail.Metadata.Label title="Sold At" text={String(dateFormat(props.sale.sold_at, "dd.mm.yyyy"))} />
			<Detail.Metadata.Label title="Support Until" text={String(dateFormat(props.sale.supported_until, "dd.mm.yyyy"))} />
			<Detail.Metadata.Label title="License" text={props.sale.license} />
			<Detail.Metadata.Separator />
			<Detail.Metadata.Label title="Number of Sales" text={String(props.sale.item.number_of_sales)} />
			<Detail.Metadata.Link title="Author" target={props.sale.item.author_url} text={props.sale.item.author_username}/>
			<Detail.Metadata.TagList title="Rating"> 
				<Detail.Metadata.TagList.Item icon={Icon.Star} color={Color.Yellow} text={String(props.sale.item.rating)}/>
				<Detail.Metadata.TagList.Item text={String(props.sale.item.rating_count)}/>
			</Detail.Metadata.TagList>
			<Detail.Metadata.Label title="Published At" text={String(dateFormat(props.sale.published_at, "dd.mm.yyyy"))} />
			<Detail.Metadata.Label title="Updated At" text={String(dateFormat(props.sale.updated_at, "dd.mm.yyyy"))} />
		  </Detail.Metadata>
		}
		actions={
		  <ActionPanel>
			<OpenInBrowserAction url={`${props.sale.item.url}`} />
		  </ActionPanel>
		}
	  />;
  }

  function SaleItem(props: { sale: saleItem; key: number; todey: Boolean, item: Boolean}) {
	const accessories = props.todey ? [
	  {text: `💵 ${price(props.sale.amount, props.sale.support_amount)}`},
	  {icon: { source: Icon.Dot, tintColor: Color.Red }}
	] : [{text: `💵 ${price(props.sale.amount, props.sale.support_amount)}`}]
	const icon = props.item == true ? props.sale.item.previews.icon_with_landscape_preview.icon_url : props.sale.previews.icon_with_landscape_preview.icon_url;
	const title = props.item == true ? props.sale.item.name : props.sale.name;

	return (
	  <List.Item
		icon={icon ?? "/"}
		title={String(title ?? "")}
		subtitle={String(dateFormat(props.sale.sold_at, "dd.mm.yyyy")) ?? ""}
		accessories={accessories}
		actions={
		  <ActionPanel>
		  	<Action.Push title="Details" target={<SaleItemDetail sale={props.sale} todey={props.todey}/>} />
		  </ActionPanel>
		}
	  />
	);
  }
  function Account(props: { infoUser: any; infoAccount: any; portfolio: any;}) {
	return (
	<List.Item
	  icon={props.infoUser.image ?? "/"}
	  title={String(`${props.infoUser.username}` ?? "")}
	  subtitle={String(`${props.infoAccount.firstname} ${props.infoAccount.surname}`) ?? ""}
	  accessories={[
		{ text: `${props.infoUser.sales}`, icon: { source: Icon.Calendar, tintColor: Color.Green } },
		{ text: `$${props.infoAccount.balance}`, icon: { source: Icon.List, tintColor: Color.Green } },
	  ]}
	  actions={
		<ActionPanel>
			<Action.Push title="Portfolio" target={<AccountPortfolio portfolio={props.portfolio}/>} />
		</ActionPanel>
	  }
	/>
  );
  }

  return (
	<List isShowingDetail={state.showdetail} isLoading={state.sales.length === 0 && state.errors.reason == undefined && state.errors.empty !== true}>
	  <List.Section title="Account">
		  {state.user.username === "" ||  state.user.username == undefined ? (
			  <List.EmptyView
				icon={{ source: Icon.Person }}
				title="Username"
			  />
			) : (
			  <Account infoUser={state.user} infoAccount={state.account} portfolio={state.portfolio}/>
		   )}
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
				  if (saleDate == fullDate && state.errors !== []) return <SaleItem sale={sale} key={index} todey={true} item={true} />;
				  if (saleDate != fullDate && state.errors !== []) return <SaleItem sale={sale} key={index} todey={false} item={true} />;
				})
			 )}
	  </List.Section>
	</List>
  );
}
