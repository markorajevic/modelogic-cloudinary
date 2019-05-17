import { init, FieldExtensionSDK, DialogExtensionSDK } from 'contentful-ui-extensions-sdk';


declare const cloudinary: any;


function swap(input: any, index_A: any, index_B: any) {
	var temp = input[index_A];

	input[index_A] = input[index_B];
	input[index_B] = temp;
}


interface InstallationParameters {
	cloudName: string;
	apiKey: string;
	extensionId: string;
}


// interface ModalInvocationParameters {
// 	fieldValue: any | null;
// }


function initFieldExtension(extension: FieldExtensionSDK) {
	extension.window.startAutoResizer();

	const installationParameters = extension.parameters.installation as InstallationParameters;

	(document.querySelector('#dialog') as HTMLElement).style.display = 'none';

	const previewPane = document.querySelector('#preview') as HTMLElement;
	const createButton = document.querySelector('#create-btn') as HTMLElement;
	const editButton = document.querySelector('#edit-btn') as HTMLElement;
	const deleteButton = document.querySelector('#delete-btn') as HTMLElement;
	var change = false;
	var preElement: number = -1;
	// function selector(element: any) {
	// 	console.log('this');
	// 	if (!change) {
	// 		console.log('el', element);
	// 		change = true;
	// 		preElement = element.path[0];
	// 	}
	// 	else {
	// 		var temp = element.path[0].parentNode;
	// 		console.log('el', element)
	// 		var temp1 = preElement.parentNode;
	// 		// element[0].parentNode = null;
	// 		temp1.appendChild(element);
	// 		preElement.parentNode = null;
	// 		temp.appendChild(preElement);
	// 		change = false;
	// 		preElement = null;
	// 	}
	// }
	function updateFieldContent(): void {
		const asset: any | null = extension.field.getValue();
		// console.log('asset', asset);
		if (asset && asset.length == 0) {
			extension.field.setValue(null);
			return;
		}
		const container = document.querySelector('#asset') as HTMLElement;
		container.innerHTML = '';
		container.style.overflow = 'auto';
		container.style.display = 'flex';
		container.style.flexWrap = 'wrap';
		if (asset) {
			for (var key in asset) {
				if (asset.hasOwnProperty(key)) {
					const img: HTMLImageElement = document.createElement('img');
					const div: HTMLDivElement = document.createElement("div");
					const deleteBtn: HTMLDivElement = document.createElement('div');
					deleteBtn.innerText = 'Delete';
					div.style.position = 'relative';
					div.className = 'image-holder';
					img.src = `https://res.cloudinary.com/${installationParameters.cloudName}/image/${asset[key].type}/h_100,w_100,c_fill/${asset[key].public_id}`;
					img.height = 100;
					img.width = 100;
					img.style.margin = "20px 10px 0 0";
					img.className = key;
					deleteBtn.className = key;
					div.className = key;
					div.addEventListener('click', function (el: any) {
						let ind = parseInt(el.srcElement.className);
						if (!change) {
							change = true;
							preElement = ind;
						}
						else {
							let values = extension.field.getValue();
							swap(values, preElement, ind);
							change = false;
							extension.field.setValue(values);
							updateFieldContent();
						}
					})
					deleteBtn.addEventListener('click', function (el: any) {
						let ind = parseInt(el.srcElement.className);
						let values = extension.field.getValue();
						values.splice(ind, 1);
						extension.field.setValue(values);
						if (ind == 0 && values.length == 0) {
							extension.field.setValue(null);
						}
						updateFieldContent();
					})
					div.appendChild(img);
					div.appendChild(deleteBtn);
					container.appendChild(div);
				}
			}
			extension.window.updateHeight();
		}

		previewPane.style.display = asset ? 'flex' : 'none';
		deleteButton.style.display = asset ? 'inline' : 'none';
		createButton.style.display = asset ? 'none' : 'inline';
	}

	// async function deleteImage() {
	// 	console.log('extension', extension.field.getValue());
	// }

	async function clearField() {
		const confirmed = await extension.dialogs.openConfirm({
			title: 'Remove this asset?',
			message: ' The asset will be removed from this entry, but still exist in the Cloudinary library.',
			intent: 'negative',
			confirmLabel: 'Yes',
			cancelLabel: 'No',
		});

		if (!confirmed) return;

		extension.field.setValue(null);
		updateFieldContent();
	}

	async function openModal(parameters: any): Promise<void> {
		let prevAssets: any | null = extension.field.getValue();
		console.log('prevAssets', prevAssets);
		let asset = await extension.dialogs.openExtension({
			id: installationParameters.extensionId,
			width: 2400,
			title: 'Select Cloudinary Asset',
			parameters: {
				isModal: true,
				fieldValue: extension.field.getValue(),
			},
		});
		console.log('asset', asset);
		asset = prevAssets.concat(asset);
		if (asset) {
			await extension.field.setValue(asset);
			updateFieldContent();
		}
	}

	updateFieldContent();

	createButton!.addEventListener('click', openModal);
	editButton!.addEventListener('click', openModal);
	deleteButton!.addEventListener('click', clearField);
}


function initDialogExtension(extension: DialogExtensionSDK) {
	const installationParameters = extension.parameters.installation as InstallationParameters;
	(document.querySelector('#field') as HTMLElement).style.display = 'none';
	(document.querySelector('#dialog') as HTMLElement)!.style.height = '700px';

	extension.window.startAutoResizer();
	let asset = null;
	// const invocationParameters: ModalInvocationParameters = extension.parameters.invocation as ModalInvocationParameters;
	// console.log('invocationParameters', invocationParameters);
	// if (invocationParameters.fieldValue[0]) {
	// 	asset = invocationParameters.fieldValue[0] ? {
	// 		resource_id: `${invocationParameters.fieldValue[0].resource_type}/${invocationParameters.fieldValue[0].type}/${invocationParameters.fieldValue[0].public_id}`,
	// 	} : null;
	// }


	const options = {
		cloud_name: String(installationParameters.cloudName),
		api_key: String(installationParameters.apiKey),
		multiple: true,
		remove_header: true,
		inline_container: document.querySelector('#dialog'),
		asset,
	};

	function onAssetSelect(data: any): void {
		const selectedAsset: any = data.assets;
		extension.close(selectedAsset);
	}

	const mediaLibrary = cloudinary.createMediaLibrary(options, { insertHandler: onAssetSelect });

	mediaLibrary.show({ asset });
}


init(async extension => {
	if (extension.parameters.invocation) {
		initDialogExtension(extension as DialogExtensionSDK);
	} else {
		initFieldExtension(extension as FieldExtensionSDK);
	}
});
