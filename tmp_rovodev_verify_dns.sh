#!/bin/bash

# DNS Verification Script for Palbamb

echo "🔍 Verifying DNS Configuration for Palbamb"
echo "=========================================="
echo ""

# Check DNS resolution
echo "📡 Checking DNS Resolution:"
echo "----------------------------"

domains=("palbamb.com" "www.palbamb.com" "palbamb.in" "www.palbamb.in")

for domain in "${domains[@]}"; do
    echo -n "Checking $domain ... "
    ip=$(nslookup $domain 2>/dev/null | grep -A1 "Name:" | grep "Address:" | awk '{print $2}' | tail -1)
    
    if [ "$ip" == "13.235.53.147" ]; then
        echo "✅ Correct (13.235.53.147)"
    else
        echo "❌ Incorrect (Got: $ip, Expected: 13.235.53.147)"
    fi
done

echo ""
echo "🌐 Testing HTTP Access:"
echo "----------------------------"

for domain in "${domains[@]}"; do
    echo -n "Testing http://$domain ... "
    status=$(curl -s -o /dev/null -w "%{http_code}" http://$domain --connect-timeout 5 2>/dev/null || echo "failed")
    
    if [ "$status" == "200" ] || [ "$status" == "301" ] || [ "$status" == "302" ]; then
        echo "✅ Accessible (HTTP $status)"
    else
        echo "❌ Not accessible (Status: $status)"
    fi
done

echo ""
echo "🔗 Testing API Endpoint:"
echo "----------------------------"
echo -n "Testing http://palbamb.com/api/health ... "
api_status=$(curl -s -o /dev/null -w "%{http_code}" http://palbamb.com/api/health --connect-timeout 5 2>/dev/null || echo "failed")

if [ "$api_status" == "200" ]; then
    echo "✅ API is responding"
else
    echo "❌ API not responding (Status: $api_status)"
fi

echo ""
echo "=========================================="
echo "Verification complete!"
