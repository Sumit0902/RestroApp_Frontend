import { HamburgerMenuIcon } from "@radix-ui/react-icons"
import { Box, Button, Flex, ScrollArea, Text } from "@radix-ui/themes" 
import DBCharts from "../components/Charts.jsx"

const Dashboard = () => {
    return (
        <div className="w-full p-2 relative h-full  ">
            <Box
                className="rounded-md " 
                style={{
                    backgroundColor: 'var(--color-background)',
                    borderRadius: 'var(--radius-4)',
                }}
            >
                {/* Header */}
                <Flex justify="between" align="center" p="4" style={{ borderBottom: '1px solid var(--gray-5)' }}>
                    <Text size="5" weight="bold">Dashboard</Text>
                    <Button variant="ghost" style={{ display: 'none' }}>
                        <HamburgerMenuIcon />
                    </Button>
                </Flex>
    
                {/* Scrollable Content Area */}
                <ScrollArea >
                    <Box p="4" className="h-screen "  >
                        <DBCharts/>
                       
                    </Box>
                </ScrollArea>
            </Box>
        </div> 
    )
}

export default Dashboard