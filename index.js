import React, { useCallback, useEffect, useState } from 'react';
import { Form, Checkbox, notification, Skeleton } from 'antd';
import { GoogleMap, Marker, StandaloneSearchBox, useJsApiLoader } from '@react-google-maps/api';

const browser = typeof window !== 'undefined' ? true : false;
const libraries = ['places'];

if (browser) require('./styles.css');

const InputAddress = props => {
	const {
		disabled = false,
		extra = null,
		googleMapsApiKey = '',
		id,
		inlineError = true,
		label = '',
		onBlur,
		onChange,
		placeholder = '',
		required = false,
		value = '',
		withLabel = false,
		withMap = true
	} = props;

	const [address, setAddress] = useState('');
	const [center, setCenter] = useState({ lat: 14.5626901, lng: 121.0084815 });
	const [custom, setCustom] = useState(false);
	const [errors, setErrors] = useState([]);
	const [map, setMap] = useState(null);
	const [markers, setMarkers] = useState([
		{
			position: {
				lat: 14.5626901,
				lng: 121.0084815
			}
		}
	]);
	const [showMap, setShowMap] = useState(true);
	const [searchTextBox, setSearchTextBox] = useState(null);

	if (!googleMapsApiKey) return <p>Missing Google Maps API Key</p>;

	const { isLoaded } = useJsApiLoader({
		id: 'google-map-script',
		googleMapsApiKey: googleMapsApiKey,
		libraries
	});

	const onLoad = useCallback(map => {
		const bounds = new window.google.maps.LatLngBounds();
		map.fitBounds(bounds);
		setMap(map);
	}, []);

	const onUnmount = useCallback(map => setMap(null), []);

	const setAddressObject = value => JSON.stringify({ lat: null, lng: null, address: value, url: '' });

	const renderInput = () => {
		const { Input } = require('antd');

		const address = value !== '' ? JSON.parse(value).address : '';

		return (
			<Input
				autoComplete="off"
				disabled={disabled}
				name={id}
				onBlur={onBlur ? onBlur : null}
				onChange={e =>
					onChange(
						{ target: { name: id, value: setAddressObject(e.target.value) } },
						id,
						setAddressObject(e.target.value)
					)
				}
				placeholder={placeholder || label || id}
				type="text"
				value={address}
			/>
		);
	};

	const renderInputStandalone = () => {
		return (
			<StandaloneSearchBox
				controlPosition={window.google.maps.ControlPosition.TOP_LEFT}
				onLoad={setSearchTextBox}
				onPlacesChanged={() => {
					const places = searchTextBox.getPlaces();
					const bounds = new window.google.maps.LatLngBounds();

					places.forEach(place => {
						if (place.geometry.viewport) {
							bounds.union(place.geometry.viewport);
						} else {
							bounds.extend(place.geometry.location);
						}
					});

					const value = JSON.stringify({
						lat: places[0].geometry.location.lat(),
						lng: places[0].geometry.location.lng(),
						address: places[0].formatted_address,
						url: places[0].url
					});
					onChange({ target: { name: id, value } }, id, value);
				}}>
				<input
					className="ant-input"
					id={id}
					name={id}
					onBlur={() => {
						setTimeout(() => {
							const places = searchTextBox.getPlaces();
							if (!places)
								notification.error('Address not found. Try to press enter in the address bar.');
						}, 1000);

						if (onBlur) onBlur();
					}}
					onChange={e => setAddress(e.target.value)}
					placeholder={placeholder || label || id}
					required={required}
					type="text"
					value={address}
				/>
			</StandaloneSearchBox>
		);
	};

	const renderInputMap = () => {
		const containerStyle = { width: '100%', height: '400px' },
			inputStyle = {
				width: 250,
				height: 40,
				padding: '0 12px',
				position: 'absolute',
				top: 10,
				right: 60
			};

		return (
			<GoogleMap
				mapContainerStyle={containerStyle}
				center={center}
				zoom={20}
				onLoad={onLoad}
				onUnmount={onUnmount}>
				<StandaloneSearchBox
					controlPosition={window.google.maps.ControlPosition.TOP_LEFT}
					onLoad={setSearchTextBox}
					onPlacesChanged={() => {
						const places = searchTextBox.getPlaces();
						const bounds = new window.google.maps.LatLngBounds();

						places.forEach(place => {
							if (place.geometry.viewport) {
								bounds.union(place.geometry.viewport);
							} else {
								bounds.extend(place.geometry.location);
							}
						});

						const nextMarkers = places.map(place => ({ position: place.geometry.location }));
						const nextCenter = _.get(nextMarkers, '0.position', center);

						setCenter(nextCenter);
						setMarkers(nextMarkers);

						const value = JSON.stringify({
							lat: places[0].geometry.location.lat(),
							lng: places[0].geometry.location.lng(),
							address: places[0].formatted_address,
							url: places[0].url
						});
						onChange({ target: { name: id, value } }, id, value);
					}}>
					<input
						className="ant-input"
						id={id}
						name={id}
						onBlur={() => {
							setTimeout(() => {
								const places = searchTextBox.getPlaces();
								if (!places)
									notification.error({
										title: 'ERROR',
										description: 'Address not found. Try to press enter in the address bar.'
									});
							}, 1000);

							if (onBlur) onBlur();
						}}
						onChange={e => setAddress(e.target.value)}
						placeholder={placeholder || label || id}
						required={required}
						style={inputStyle}
						type="text"
						value={address}
					/>
				</StandaloneSearchBox>
				{markers.map((d, index) => (
					<Marker key={index} position={d.position} />
				))}
			</GoogleMap>
		);
	};

	useEffect(() => {
		const address = value !== '' ? JSON.parse(value) : '';
		if (address) {
			setAddress(address.address);
			setCenter(address);
		}
	}, [value]);

	let formItemCommonProps = {
		colon: false,
		label: withLabel ? (
			<>
				<div style={{ float: 'right' }}>{extra}</div> <span className="label">{label}</span>
			</>
		) : (
			false
		),
		required,
		validateStatus: errors.length != 0 ? 'error' : 'success'
	};
	if (inlineError) formItemCommonProps = { ...formItemCommonProps, help: errors.length != 0 ? errors[0] : '' };

	return (
		<Form.Item {...formItemCommonProps}>
			<Checkbox checked={custom} name={id} onChange={e => setCustom(e.target.checked)} disabled={disabled}>
				Custom Address
			</Checkbox>

			{!custom && (
				<Checkbox
					checked={showMap && withMap}
					name={id}
					onChange={e => setShowMap(e.target.checked)}
					disabled={disabled}>
					Map
				</Checkbox>
			)}

			{browser && isLoaded ? (
				custom ? (
					renderInput()
				) : showMap && withMap ? (
					renderInputMap()
				) : (
					renderInputStandalone()
				)
			) : (
				<Skeleton active paragraph={{ rows: 1, width: '100%' }} title={false} />
			)}
		</Form.Item>
	);
};

export default InputAddress;
