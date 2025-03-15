import { SvgIcon, SvgIconProps } from "@mui/material"
import { ForwardedRef, forwardRef } from "react"

const Bot = forwardRef((props: SvgIconProps, ref: ForwardedRef<SVGSVGElement>) => (
  <SvgIcon
    ref={ref}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    {...props}
  >
    <path d="M17.753 14a2.25 2.25 0 0 1 2.25 2.25v.905A3.75 3.75 0 0 1 18.696 20C17.13 21.344 14.89 22.001 12 22.001c-2.89 0-5.128-.657-6.691-2a3.75 3.75 0 0 1-1.305-2.844v-.907A2.25 2.25 0 0 1 6.254 14h11.5ZM11.9 2.007 12 2a.75.75 0 0 1 .743.649l.007.101v.75h3.5a2.25 2.25 0 0 1 2.25 2.25v4.505a2.25 2.25 0 0 1-2.25 2.25h-8.5a2.25 2.25 0 0 1-2.25-2.25V5.75A2.25 2.25 0 0 1 7.75 3.5h3.5v-.75a.75.75 0 0 1 .649-.743L12 2l-.101.007ZM9.749 6.5a1.25 1.25 0 1 0 0 2.499 1.25 1.25 0 0 0 0-2.499Zm4.493 0a1.25 1.25 0 1 0 0 2.499 1.25 1.25 0 0 0 0-2.499Z" />
  </SvgIcon>
))

export default Bot
