import { useState, useEffect } from 'react';
import { TextField } from '@mui/material';
import { toJalaali, toGregorian, jalaaliToDateObject } from 'jalaali-js';

const PersianDateInput = ({ value, onChange, label, required, ...props }) => {
	const [displayValue, setDisplayValue] = useState('');
	const [gregorianValue, setGregorianValue] = useState('');

	// Convert Gregorian to Persian for display
	useEffect(() => {
		if (value) {
			// If value is in YYYY-MM-DD format (Gregorian), convert to Persian
			if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
				const [year, month, day] = value.split('-').map(Number);
				const jDate = toJalaali(year, month, day);
				setDisplayValue(`${jDate.jy}/${String(jDate.jm).padStart(2, '0')}/${String(jDate.jd).padStart(2, '0')}`);
				setGregorianValue(value);
			} else {
				// If already in Persian format, keep it
				setDisplayValue(value);
				// Try to parse Persian date
				if (typeof value === 'string' && value.match(/^\d{4}\/\d{2}\/\d{2}$/)) {
					const [jy, jm, jd] = value.split('/').map(Number);
					const gDate = toGregorian(jy, jm, jd);
					setGregorianValue(`${gDate.gy}-${String(gDate.gm).padStart(2, '0')}-${String(gDate.gd).padStart(2, '0')}`);
				}
			}
		} else {
			setDisplayValue('');
			setGregorianValue('');
		}
	}, [value]);

	const handleChange = (e) => {
		const inputValue = e.target.value;
		setDisplayValue(inputValue);
		
		// Try to parse Persian date (YYYY/MM/DD format)
		if (inputValue.match(/^\d{4}\/\d{2}\/\d{2}$/)) {
			const [jy, jm, jd] = inputValue.split('/').map(Number);
			try {
				const gDate = toGregorian(jy, jm, jd);
				const gregorianStr = `${gDate.gy}-${String(gDate.gm).padStart(2, '0')}-${String(gDate.gd).padStart(2, '0')}`;
				setGregorianValue(gregorianStr);
				// Call onChange with Gregorian date for backend compatibility
				if (onChange) {
					onChange({
						...e,
						target: {
							...e.target,
							value: gregorianStr
						}
					});
				}
			} catch (err) {
				console.error('Invalid Persian date:', err);
			}
		} else if (inputValue === '') {
			setGregorianValue('');
			if (onChange) {
				onChange({
					...e,
					target: {
						...e.target,
						value: ''
					}
				});
			}
		}
	};

	return (
		<TextField
			{...props}
			label={label}
			value={displayValue}
			onChange={handleChange}
			required={required}
			placeholder="1403/10/15"
			helperText="تاریخ را به صورت شمسی وارد کنید (مثال: 1403/10/15)"
		/>
	);
};

export default PersianDateInput;

