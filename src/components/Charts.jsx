
import { Line, Bar, Pie, Area, LineChart, BarChart, PieChart, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Flex } from '@radix-ui/themes'

const DBCharts = () => {

    const revenueData = [
        { month: "Jan", revenue: 2000 },
        { month: "Feb", revenue: 2500 },
        { month: "Mar", revenue: 3000 },
        { month: "Apr", revenue: 3500 },
        { month: "May", revenue: 4000 },
        { month: "Jun", revenue: 4500 },
    ]

    const expensesData = [
        { department: "Sales", expenses: 4000 },
        { department: "Marketing", expenses: 3000 },
        { department: "R&D", expenses: 2000 },
        { department: "Admin", expenses: 1000 },
    ]

    const marketShareData = [
        { name: "Product A", value: 400 },
        { name: "Product B", value: 300 },
        { name: "Product C", value: 200 },
        { name: "Product D", value: 100 },
    ]

    const userGrowthData = [
        { month: "Jan", users: 4000 },
        { month: "Feb", users: 5000 },
        { month: "Mar", users: 6000 },
        { month: "Apr", users: 7000 },
        { month: "May", users: 8000 },
        { month: "Jun", users: 10000 },
    ]

    return (
        <Flex style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px', height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div style={{ flex: 1, minWidth: '200px', height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={expensesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="department" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="expenses" fill="#82ca9d" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div style={{ flex: 1, minWidth: '200px', height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={marketShareData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            label
                        />
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div style={{ flex: 1, minWidth: '200px', height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={userGrowthData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="users" stroke="#8884d8" fill="#8884d8" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Flex>
    )
}

export default DBCharts