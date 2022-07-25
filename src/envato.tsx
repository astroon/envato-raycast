import { List, Detail, Icon, environment } from "@raycast/api";
import dateFormat from "dateformat";
import { Account } from "./accountEnvato";
import { SaleItem, PayoutItem } from "./saleItem";
import { useFetch, fullDate } from "./utils";
import fs from "fs";

/*-----------------------------------*/
/*------ INDEX
/*-----------------------------------*/
export default function Command() {
	const state = useFetch();
	
	// IF EMPTY
	if (state.errors.reason !== undefined && state.errors.empty !== true) {
		return ( <Detail markdown={`# 😢 ${state.errors.reason ?? ""} \n \`\`\`\n${state.errors.description ?? ""}\n\`\`\``} />);
	}
  
  
	let arrPay = [];
	let array3 = [];
	let sales = state.sales;
	var cache;
	
	fs.readFile(`${environment.supportPath}/cache.json`, function(err, buf) {
	  console.log(JSON.parse(buf.toString()));
	  cache = JSON.parse(buf.toString());
	  sales = JSON.parse(buf.toString());
	});

  return (
	<List isShowingDetail={state.showdetail} isLoading={Object.keys(sales).length === 0 && state.errors.reason == undefined && state.errors.empty !== true}>
		<Account state={state}/>
  			<List.Section title="Sales">
	  			{state.user.username === "" ||  state.user.username == undefined ? (
						<List.EmptyView icon={{ source: Icon.TwoArrowsClockwise }} title="Loading..." />
		  			) : (
			  			state.statement.results.map((stateIt, index) => {
			  				if(stateIt.type == "Payout") {
					  			arrPay.push(stateIt);
				  			}
			  			}),
			  			array3 = arrPay.concat(state.sales),
			  			console.log(array3),
						array3.map((sale, index) => {
			  			const saleDate = String(dateFormat(sale["sold_at"], "dd, mm, yyyy"));
						 <PayoutItem sale={sale} state={state}/>
			  			if (saleDate == fullDate && sale.type === undefined && state.errors !== []) return <SaleItem sale={sale} key={index} todey={true} item={true} />;
			  			if (saleDate != fullDate && sale.type === undefined && state.errors !== []) return <SaleItem sale={sale} key={index} todey={false} item={true} />;
						})
		 			)}
  			</List.Section>
		</List>
  );
}
