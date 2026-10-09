using Crr.Api.Data;
using Crr.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddCors(options =>
{
    var origins = builder.Configuration.GetSection("Cors:Origins").Get<string[]>()
                  ?? ["http://localhost:5173"];
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins(origins)
            .AllowAnyHeader()
            .AllowAnyMethod());
});

builder.Services.AddSingleton<IPositionStore>(sp =>
{
    var env = sp.GetRequiredService<IHostEnvironment>();
    var config = sp.GetRequiredService<IConfiguration>();
    var logger = sp.GetRequiredService<ILoggerFactory>().CreateLogger("Crr.Startup");
    var path = CsvPositionLoader.ResolvePath(env, config);
    return InMemoryPositionStore.LoadFromCsv(path, logger);
});
builder.Services.AddSingleton<IPositionQueryService, PositionQueryService>();

var app = builder.Build();

// Force CSV load at startup so the first grid request is not paying parse cost.
_ = app.Services.GetRequiredService<IPositionStore>();

app.UseCors();
app.MapControllers();
app.MapGet("/health", (IPositionStore store) => Results.Ok(new
{
    status = "ok",
    rows = store.Count,
}));

app.Run();

public partial class Program;
