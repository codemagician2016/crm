interface ITextArea {
    label: string,
    name: string,
    cssClass?: string,
    type?: string,
    value: string | number | undefined,
    errorMsg?: string,
    placeholder?: string,
    disabled?: boolean
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onBlur: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
}

const TextArea = ({ label, name, cssClass, value, errorMsg, placeholder, disabled = false, onChange, onBlur }: ITextArea) => {
    return (
        <>
            <label>{label}</label>
            <textarea className={`form-control ${cssClass}`} placeholder={placeholder} name={name} value={value}
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

export default TextArea;