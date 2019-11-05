
/**
 * Remediation object interface
 * @argument {string} pattern : xpath expression of the pattern to be remmaped
 * @argument {string} remapping : root node replacement
 * 
 */
export default interface Remediation{
    pattern:string,
    remapping:string
}
