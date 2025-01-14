import { Button, Text } from "@radix-ui/themes"
import { Link } from "react-router-dom"

const SidebarLink = ({ href, icon, text }) => {
    // console.log(href, icon, text)
    return (
        <Link to={href}   className="block py-2" >
            <Button variant="ghost" className="justify-start py-4" style={{ justifyContent: 'flex-start', width: '100%' }}>
                {icon}
                <Text className="text-base" ml="2">{text}</Text>
            </Button>
        </Link>
    )
}

export default SidebarLink