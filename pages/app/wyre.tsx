import React, { useEffect, useState } from "react";
import Head from 'next/head';
import { useRouter } from 'next/router';

import { WyreApp } from "../../src/WyreApp";
import { getQueryVariable } from "../../src/helpers";

function DappBrowserPage() {
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    const env = getQueryVariable("env", router) || "prod";

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);


    return (<>
      <Head>
        <script src="https://verify.sendwyre.com/js/verify-module-init.js"></script>
      </Head>
      {mounted && 
        <WyreApp env={env} />}
    </>);
}

export default DappBrowserPage;
