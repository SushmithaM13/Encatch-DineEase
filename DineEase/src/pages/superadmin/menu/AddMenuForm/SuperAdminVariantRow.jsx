import React from "react";

export default function SuperAdminVariantRow({ v, index, onChange, onRemove }) {
  const change = (key, value) => onChange(index, key, value);

  return (
    <tr className="variant-row">
      <td>
        <input
          type="text"
          value={v.variantName || ""}
          onChange={(e) => change("variantName", e.target.value)}
        />
      </td>

      <td>
        <input
          type="text"
          value={v.variantType || ""}
          onChange={(e) => change("variantType", e.target.value)}
        />
      </td>

      <td>
        <input
          type="text"
          value={v.quantityUnit || ""}
          onChange={(e) => change("quantityUnit", e.target.value)}
          placeholder="100g, 1 plate"
        />
      </td>

      <td>
        <input
          type="number"
          value={v.price ?? 0}
          onChange={(e) => change("price", e.target.value === "" ? "" : Number(e.target.value))}
        />
      </td>

      <td>
        <input
          type="number"
          value={v.discountPrice ?? 0}
          onChange={(e) => change("discountPrice", e.target.value === "" ? "" : Number(e.target.value))}
        />
      </td>

      <td>
        <input
          type="number"
          disabled
          value={((v.price ?? 0) - (v.discountPrice ?? 0)).toFixed ? ((v.price ?? 0) - (v.discountPrice ?? 0)).toFixed(2) : (v.price ?? 0) - (v.discountPrice ?? 0)}
        />
      </td>

      <td>
        <input
          type="number"
          value={v.displayOrder ?? 0}
          onChange={(e) => change("displayOrder", e.target.value === "" ? "" : Number(e.target.value))}
        />
      </td>

      <td>
        <input
          type="checkbox"
          checked={!!v.isDefault}
          onChange={(e) => change("isDefault", e.target.checked)}
        />
      </td>

      <td>
        <input
          type="checkbox"
          checked={!!v.isAvailable}
          onChange={(e) => change("isAvailable", e.target.checked)}
        />
      </td>

      <td>
        <button className="delete-btn" onClick={() => onRemove(index)}>✕</button>
      </td>
    </tr>
  );
}
