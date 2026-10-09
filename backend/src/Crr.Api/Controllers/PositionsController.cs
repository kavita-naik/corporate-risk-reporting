using Crr.Api.Models;
using Crr.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Crr.Api.Controllers;

[ApiController]
[Route("api/positions")]
public sealed class PositionsController : ControllerBase
{
    private readonly IPositionQueryService _service;

    public PositionsController(IPositionQueryService service)
    {
        _service = service;
    }

    [HttpGet]
    public IActionResult List([FromQuery] PositionQuery query) => Ok(_service.Query(query));

    [HttpGet("aggregates")]
    public IActionResult Aggregates([FromQuery] PositionQuery query) => Ok(_service.Aggregate(query));

    [HttpGet("meta")]
    public IActionResult Meta() => Ok(_service.Metadata);

    [HttpGet("{tradeId}")]
    public IActionResult GetById(string tradeId)
    {
        var row = _service.GetByTradeId(tradeId);
        return row is null ? NotFound() : Ok(row);
    }
}
