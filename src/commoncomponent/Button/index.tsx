import { ReactNode } from "react"
import { Button } from "react-bootstrap"

interface IPrimaryButton {
    label: string,
    onClick: () => void,
    type?: "button" | "submit" | "reset",
    icon?: ReactNode,
    isDisabled: boolean
}

export const PrimaryButton = ({ label, onClick, type = "button", icon, isDisabled = false }: IPrimaryButton) => {
    return <Button onClick={onClick} type={type} variant="primary" disabled={isDisabled} className="mainBtn">
        <span className="flex items-center justify-center">
            <div>{icon} </div>
            <div>{label}</div>
        </span>
    </Button>
}