import Image from "next/image";
import React from "react";

import logo from "./../images/pnb2.webp";
function LogoArea() {
  return (
    <div className="w-full flex-row flex items-center justify-center">
      <Image
        src={logo}
        alt="Pot"
        width={100}
        height={100}
        className="rounded-full mb-5"
      />
    </div>
  );
}

export default LogoArea;
