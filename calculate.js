
var total = 0;
var order = 0;
var total_per_month = new Array();
var total_per_year = new Array();
var total_year = 0;
var total_month = 0;

function calculate(next){
	var opts = {
		method: 'GET',      
		headers: {}
	};
	fetch(' https://shopee.com.my/api/v4/order/get_order_list?limit=20&list_type=3&offset='+next, opts).then(function (response) {
		return response.json();
	})
	.then(function (body) {
		var next_offset = body.data.next_offset;
		if(next_offset >= 0){
			for (let [key, value] of Object.entries(body.data.details_list)) {
				var total_temp = value.info_card.final_total / 100000;
				total += total_temp;
				order++;
				
				if(body.data.details_list.length > 0 && key !== body.data.details_list[body.data.details_list.length -1])
				{
				let shipping_time = new Date(value.shipping.tracking_info.ctime * 1000); // dalam unix timestamp
				let shipping_year = shipping_time.getFullYear();
				let shipping_month = shipping_time.getMonth() + 1; // nak start dari january - 01 until december - 12
					let next_arr = null;
					if( key < body.data.details_list.length -1)
					{
						next_arr = body.data.details_list[key+1];
						let next_shipping_year = new Date(next_arr.shipping.tracking_info.ctime * 1000).getFullYear();
						let next_shipping_month = new Date(next_arr.shipping.tracking_info.ctime * 1000).getMonth() + 1	
						// get for year
						if(shipping_year ===  next_shipping_year)
						{
							total_year += total_temp;
						}
						else
						{
							total_per_year.push({ "year": shipping_year, "sum": total_year });
							total_year = 0;
						}

						// get for month and same year
						if(shipping_year === next_shipping_year && shipping_month ===  next_shipping_month)
						{
							total_month += total_temp;
						}
						else
						{
							total_per_month.push({
								"year": shipping_year,
								"month": shipping_month,
								"sum": total_month,
							});
							total_month = 0;
						}
					}	
					
				}
	    			console.log(order + ":", "RM " + total_temp + " - ", value.info_card.order_list_cards[0].items[0].name);
				
			}
			calculate(next_offset);
		} else {
			console.log('Calculation completed!');
			total_per_year.forEach((v, i) => {
				console.log('SPENDING YEAR: ' + v.year + ' TOTAL: RM ' + Math.round(v.sum * 100) / 100);
			})
			total_per_month.forEach((v, i) => {
				console.log('SPENDING YEAR: ' + v.year + ' SPENDING MONTH ' + v.month + ' TOTAL: RM ' + Math.round(v.sum * 100) / 100);
			})
			console.log('GRAND TOTAL: RM ' + Math.round(total * 100) / 100);
		}
	});
}
calculate(0);
