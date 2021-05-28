import React, { useEffect, useState } from "react";
import Head from 'next/head';

import { WyreApp } from "../../src/WyreApp";


function DappBrowserPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    return (<>
      <Head>
        <script src="https://verify.sendwyre.com/js/verify-module-init.js"></script>
      </Head>
      {mounted && 
        <WyreApp />}
    </>);
}

export default DappBrowserPage;
