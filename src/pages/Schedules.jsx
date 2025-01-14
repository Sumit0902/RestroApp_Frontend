import { useState } from 'react';
import TimeTable from '@/components/TimeTable.jsx';
import { format } from 'date-fns';
import { HamburgerMenuIcon } from "@radix-ui/react-icons"
import { Box, Flex, ScrollArea, Text } from "@radix-ui/themes" 
import { Link } from "react-router-dom"
import {  addDays, getWeek } from 'date-fns';

 

import { Button } from "@/components/ui/button"
import Calendar from '@/components/Calendar.jsx';
import Schedule from '@/components/Schedule.jsx';
import { useSelector } from 'react-redux';
 


function Schedules() {
 
  
  return (
    <div className="w-full p-2 relative h-full">
        <Box className="rounded-md" style={{ backgroundColor: 'var(--color-background)', borderRadius: 'var(--radius-4)' }}>
            {/* Header */}
            <Flex justify="between" align="center" p="4" style={{ borderBottom: '1px solid var(--gray-5)' }}>
                <Text size="5" weight="bold">Schedule</Text>
                <Button variant="ghost" style={{ display: 'none' }}>
                    <HamburgerMenuIcon />
                </Button>
            </Flex>

            {/* Scrollable Content Area */}
            <ScrollArea>
                <Box p="4" className="h-screen">
                    <div className="space-y-4">
                        <Schedule/>
                    </div>
                </Box>
            </ScrollArea>
        </Box>
    </div>
)
}

export default Schedules;