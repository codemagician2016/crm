interface IInput {
    label: string,
    name: string,
    cssClass?: string,
    type?: string,
    value: string | number | undefined,
    errorMsg?: string,
    placeholder?: string,
    disabled?: boolean
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
}

const Input = ({ label, name, cssClass, type, value, errorMsg, placeholder, disabled = false, onChange, onBlur }: IInput) => {
    return (
        <>
            <label>{label}</label>
            <input className={`form-control ${cssClass}`} placeholder={placeholder} name={name} type={type || "text"} value={value}
                disabled={disabled}
                onChange={onChange} onBlur={onBlur} />
            {
                (errorMsg && (
                    <p className='form-error'>{errorMsg}</p>
                ))
            }
        </>
    )
}

export default Input;