import { Card } from "react-bootstrap";

interface ICardComponent {
    children: React.ReactNode,
    header?:string
}

const CardComponent = ({ children, header }: ICardComponent) => {
    return (
        <Card className="border-0">
            {header && (
                <Card.Header className='cardHeader'>
                    <h4 className="cardTitle">{header}</h4>
                </Card.Header>
            )}
            <Card.Body className="px-0">
                {children}
            </Card.Body>
        </Card>
    );
}

export default CardComponent;