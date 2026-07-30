import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    const API_TOKEN = process.env.ALRAGHEB_TOKEN;
    const ENDPOINT = 'https://api.alragheb-store.com/client/api/products?limit=500';

    if (!API_TOKEN) {
        return NextResponse.json({ success: false, error: "API Token Missing" }, { status: 200 });
    }

    try {
        const response = await fetch(ENDPOINT, {
            method: 'GET',
            headers: {
                'api-token': API_TOKEN,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            return NextResponse.json({ success: false, error: `Connection Error: ${response.status}` }, { status: 200 });
        }

        const rawData = await response.json();
        let allExtractedItems: any[] = [];

        function deepScan(obj: any, inheritedContext = '', parentName = '') {
            if (!obj || typeof obj !== 'object') return;

            const name = obj.الاسم || obj.name || obj.title || obj.product_name || obj.value || obj.label || '';
            const price = obj.السعر || obj.price || obj.cost || obj.amount || obj.rate || 0;
            const id = obj.id || obj.product_id || obj.service_id || obj.item_id;

            const rawStatus = obj.status !== undefined ? obj.status : (obj.active !== undefined ? obj.active : (obj.available !== undefined ? obj.available : 1));
            const isAvailable = (rawStatus === 1 || rawStatus === true || String(rawStatus).toLowerCase() === 'active' || String(rawStatus).toLowerCase() === 'available' || String(rawStatus) === '1' || String(rawStatus) === 'موافق' || String(rawStatus) === 'مكتمل' || String(rawStatus) === 'قبول');

            let currentContext = inheritedContext;
            const detectedCatName = obj.category_name || obj.category?.name || obj.section?.name || (id && name && !price ? name : "");
            
            const findIdentity = (text: string) => {
                const low = text.toLowerCase();
                if (low.includes('fire') || low.includes('fier') || low.includes('فري فاير') || low.includes('booyah')) return 'FREE FIRE';
                
                // --- فقاعة كلاش رويال الحصرية ---
                if (low.includes('royale') || low.includes('رويال')) return 'CLASH_ROYALE';
                // --- نهاية الفقاعة ---

                if (low.includes('clash of clans') || low.includes('clah of clans') || low.includes('clash') || low.includes('clah') || low.includes('كلاش') || low.includes('clans') || low.includes('كلانز')) return 'CLASH OF CLANS';
                if (low.includes('pubg') || low.includes('ببجي')) return 'PUBG';
                return null;
            };

            const identity = findIdentity(name) || findIdentity(detectedCatName) || findIdentity(parentName);
            if (identity) currentContext = identity;

            if (id && Number(price) >= 10 && name) {
                allExtractedItems.push({
                    id: id,
                    name: String(name),
                    price: Number(price),
                    category_name: currentContext,
                    category_id: obj.category_id || obj.category?.id || '',
                    image: obj.image || obj.img || obj.thumbnail || '',
                    available: isAvailable
                });
            }

            if (Array.isArray(obj)) {
                obj.forEach(item => deepScan(item, currentContext, name || parentName));
            } else {
                Object.keys(obj).forEach(key => {
                    const value = obj[key];
                    if (value && typeof value === 'object') {
                        let nextContext = currentContext;
                        const keyIdentity = findIdentity(key);
                        if (keyIdentity) nextContext = keyIdentity;
                        deepScan(value, nextContext, (id && name) ? name : parentName);
                    }
                });
            }
        }

        deepScan(rawData);

        const uniqueProducts = Array.from(new Map(allExtractedItems.map(item => [String(item.id) + String(item.price), item])).values());
        return NextResponse.json(uniqueProducts);

    } catch (error: any) {
        console.error("Products API Critical Failure:", error.message);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 200 });
    }
}
