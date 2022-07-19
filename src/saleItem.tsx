  import {
	  ActionPanel, Action, List,
	  getPreferenceValues, OpenInBrowserAction,
	  showToast, ToastStyle,
	  Detail, Icon, Color,
	} from "@raycast/api";
import dateFormat from "dateformat";
  import { envatoErrors, envatoUser, saleItem, saleItemMeta, wpThemeMetadata, previewsItem } from "./types";
  import { SaleItemDetail } from "./saleItemDetail";
  
  function price(price: "", support: "") {
	  let support_out = "";
	  if (parseInt(support) != 0) {
		support_out = " + $" + support + "";
	  }
	  return "$" + price + support_out;
	}
  
  export function SaleItem(props: { sale: saleItem; key: number; todey: Boolean, item: Boolean}) {
	const accessories = props.todey ? [
	  {text: `💵 ${price(props.sale.amount, props.sale.support_amount)}`},
	  {icon: { source: Icon.Dot, tintColor: Color.Red }}
	] : [{ text: price(props.sale.amount, props.sale.support_amount), icon: { source: Icon.BankNote, tintColor: Color.Green } }]
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
  
  export function PayoutItem(props: { sale: saleItem; state: any;}) {
	  	const saleDateSt = String(dateFormat(props.sale["date"], "dd.mm.yyyy"));

		if (props.sale.type !== "Payout" && props.state.errors === [])  {
			return;
		}
	
		return <List.Item
		  icon ={{ source: Icon.ArrowRight, tintColor: Color.Blue }}
		  title={String(props.sale.detail)}
		  subtitle={String(saleDateSt) ?? ""}
		   accessories={[ { text: String(props.sale.amount) } ]}
		  />;
  }
  
  
  export function SaleItemDetail(props: { sale: saleItem; todey: Boolean}) { 
	  console.log(props.sale);
	  	var item = props.sale.item !== undefined ? props.sale.item : props.sale;
		var metadata = props.sale.item?.wordpress_theme_metadata !== undefined ? props.sale.item.wordpress_theme_metadata : props.sale;
		  const theme_name = metadata !== undefined ? `- **Theme Name:** ${metadata.theme_name ?? metadata.name}`: "";
		const author_name = metadata !== undefined ? `- **Author Name:** ${metadata.author_name ?? metadata.author_username}` : "";
		const version = metadata.version !== undefined ? `- **Version:** ${metadata.version}` : "";
		const description = metadata !== undefined ? "- **Description:** " + metadata.description : "";
		const markdown = `# ${item.name}
  ![illustration](${item.previews.icon_with_landscape_preview.landscape_url})
  ${theme_name}
  ${author_name}
  ${version}
  ${description}`;
  
	  return <Detail markdown={markdown} 
		navigationTitle={item.name} 
		metadata={
			<Detail.Metadata>
			  <Detail.Metadata.TagList title={props.sale.amount ? "Amount" : "Price"}>
				  <Detail.Metadata.TagList.Item text={`$ ${props.sale.amount ?? props.sale.price_cents / 100}`} color={Color.Green} />
			  </Detail.Metadata.TagList>

				<Detail.Metadata.TagList title="Support Amount"> 
					  <Detail.Metadata.TagList.Item text={`$ ${props.sale.support_amount}`} color={Color.Blue} />
				</Detail.Metadata.TagList>  
				<Detail.Metadata.Label title="Sold At" text={String(dateFormat(props.sale.sold_at, "dd.mm.yyyy"))} />
				  <Detail.Metadata.Label title="Support Until" text={String(dateFormat(props.sale.supported_until, "dd.mm.yyyy"))} />
			  
			  <Detail.Metadata.Label title={props.sale.license ? "License" : "ID"} text={props.sale.license ?? String(props.sale.id)} />
			  <Detail.Metadata.Separator />
			  <Detail.Metadata.Label title="Number of Sales" text={String(item.number_of_sales)} />
			  <Detail.Metadata.Link title="Author" target={item.author_url} text={item.author_username}/>
			  <Detail.Metadata.TagList title="Rating"> 
				  <Detail.Metadata.TagList.Item icon={Icon.Star} color={Color.Yellow} text={String(item.rating.rating ?? item.rating )}/>
				  <Detail.Metadata.TagList.Item text={String(item.rating.count ?? item.rating_count)}/>
			  </Detail.Metadata.TagList>
			  <Detail.Metadata.Label title="Published At" text={String(dateFormat(props.sale.published_at, "dd.mm.yyyy"))} />
			  <Detail.Metadata.Label title="Updated At" text={String(dateFormat(props.sale.updated_at, "dd.mm.yyyy"))} />
			</Detail.Metadata>
		  }
		  actions={
			<ActionPanel>
			  <OpenInBrowserAction url={`${item.url}`} />
			</ActionPanel>
		  }
		/>;
	}