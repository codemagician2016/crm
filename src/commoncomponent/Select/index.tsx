interface ISelect {
    label?: string,
    name?: string,
    cssClass?: string,
    options: ISelectOption[],
    value: string,
    errorMsg?: string,
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLSelectElement>) => void;
}

const Select = ({ label, name, cssClass, options, value, errorMsg, onChange, onBlur }: ISelect) => {
    return (
        <>
            <label htmlFor={(value || '').replaceAll(' ', '')}>{label}</label>
            <select className={`form-select ${cssClass}`} onChange={onChange} onBlur={onBlur} value={value} name={name} id={(name || '').replaceAll(' ', '')}>
                {
                    options?.map(val => (
                        <option key={val.value} value={val.value}>{val.label}</option>
                    ))
                }
            </select>
            {
                (errorMsg && (
                    <p className='form-error'>{errorMsg}</p>
                ))
            }
        </>
    )
}

export default Select;