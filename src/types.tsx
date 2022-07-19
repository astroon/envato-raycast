
export interface envatoErrors {
		empty?: boolean;
		reason?: string;
		description?: string;
};

export interface  envatoUser {
		username?: string;
		sales?: string;
		image?: string;
};

export interface saleItem {
	item?: saleItemMeta;
	amount?: Number;
	support_amount?: Number;
	previews?: previewsItem;
	detail?: [];
	type?: String;
	name?: String;
	wordpress_theme_metadata?: wpThemeMetadata;
};

export interface  saleItemMeta {
		wordpress_theme_metadata?: wpThemeMetadata;
		url: [];
		name?: string;
};

export interface  wpThemeMetadata {
		theme_name?: string;
		author_name?: string;
		version?: string;
		description?: string;
};

export interface  previewsItem { 
	icon_with_landscape_preview?: String;
};
