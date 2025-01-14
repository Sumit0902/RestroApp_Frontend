
import { HamburgerMenuIcon } from "@radix-ui/react-icons"
import { Box, Flex, ScrollArea, Text } from "@radix-ui/themes"


import { Button } from "@/components/ui/button"

function TaskList() {

    return (
        <div className="w-full p-2 relative h-full">
            <Box className="rounded-md" style={{ backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-4)' }}>
                {/* Header */}
                <Flex justify="between" align="center" p="4" style={{ borderBottom: '1px solid var(--gray-5)' }}>
                    <Text size="5" weight="bold">TaskList</Text>
                    <Button variant="ghost" style={{ display: 'none' }}>
                        <HamburgerMenuIcon />
                    </Button>
                </Flex>

                {/* Scrollable Content Area */}
                <ScrollArea>
                    <Box p="4" className="h-screen">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between space-x-4">
                                <div className="flex items-center space-x-4">
                                    Task list table will go here
                                </div>
                                <div className='flex gap-4'>

                                </div>
                            </div>



                        </div>
                    </Box>
                </ScrollArea>
            </Box>
        </div>
    )
}

export default TaskList;