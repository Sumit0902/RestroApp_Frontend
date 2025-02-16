import { CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { HamburgerMenuIcon } from '@radix-ui/react-icons'
import { Box, Button, Flex, ScrollArea, Text } from '@radix-ui/themes' 
import { useState } from 'react'

const RequestLeave = () => {


    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
    const [reason, setReason] = useState('')
    const [status, setStatus] = useState('pending')

    
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
                    <Text size="5" weight="bold">Request Leave</Text>
                    <Button variant="ghost" style={{ display: 'none' }}>
                        <HamburgerMenuIcon />
                    </Button>
                </Flex>

                {/* Scrollable Content Area */}
                <ScrollArea >
                    <Box p="4" style={{ paddingBottom: '20px' }} className="h-screen text-left "  >
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold">Request Leave Form</CardTitle>
                        </CardHeader>
                        <CardContent>
                      
                        </CardContent>
                    </Box>
                  
                </ScrollArea>
            </Box>
        </div>
    )
}

export default RequestLeave